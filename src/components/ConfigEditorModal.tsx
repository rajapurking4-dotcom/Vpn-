import React, { useState, useMemo } from 'react';
import { 
  X, 
  Copy, 
  Download, 
  Check, 
  Save, 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Wand2, 
  ListFilter,
  Terminal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ServerConfig } from '../types/vpn';
import { downloadSingleConfigFile } from '../utils/zipExport';
import { BdixBadge, isServerBdixOptimized } from './BdixBadge';

interface ConfigEditorModalProps {
  server: ServerConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedServer: ServerConfig) => void;
}

export interface ValidationError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
  directive?: string;
}

// Comprehensive set of standard OpenVPN directives
const VALID_OPENVPN_DIRECTIVES = new Set([
  'client', 'tls-client', 'dev', 'proto', 'remote', 'resolv-retry', 'nobind', 
  'persist-key', 'persist-tun', 'remote-cert-tls', 'cipher', 'data-ciphers', 
  'data-ciphers-fallback', 'auth', 'verb', 'mute', 'route-delay', 'dhcp-option', 
  'redirect-gateway', 'tls-version-min', 'tls-version-max', 'auth-nocache', 
  'compress', 'comp-lzo', 'explicit-exit-notify', 'topology', 'pull', 'fast-io', 
  'sndbuf', 'rcvbuf', 'tun-mtu', 'mssfix', 'fragment', 'inactive', 'ping', 
  'ping-restart', 'route', 'block-outside-dns', 'setenv', 'ca', 'cert', 'key', 
  'tls-auth', 'tls-crypt', 'pkcs12', 'secret', 'keysize', 'port', 'keepalive', 
  'user', 'group', 'float', 'management', 'log', 'log-append', 'status', 
  'status-version', 'comp-noadapt', 'passtos', 'tun-ipv6', 'link-mtu'
]);

export const ConfigEditorModal: React.FC<ConfigEditorModalProps> = ({
  server,
  isOpen,
  onClose,
  onSave,
}) => {
  const [content, setContent] = useState(server.rawConfig);
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(true);
  const [activeHighlightLine, setActiveHighlightLine] = useState<number | null>(null);

  // Real-time syntax validator function
  const validationResult = useMemo(() => {
    const rawLines = content.split('\n');
    const errors: ValidationError[] = [];
    let insideTag: string | null = null;
    const tagOpenLine: Record<string, number> = {};

    let foundClient = false;
    let foundDev = false;
    let foundProto = false;
    let foundRemote = false;

    rawLines.forEach((rawLine, index) => {
      const lineNum = index + 1;
      const trimmed = rawLine.trim();

      // Skip empty lines
      if (!trimmed) return;

      // Skip comments
      if (trimmed.startsWith('#') || trimmed.startsWith(';')) return;

      // Handle XML-style tags: <ca>, </ca>, <cert>, </cert>, <key>, </key>, <tls-auth>, </tls-auth>, <tls-crypt>, </tls-crypt>
      const openTagMatch = trimmed.match(/^<([a-zA-Z0-9_-]+)>$/);
      if (openTagMatch) {
        const tagName = openTagMatch[1];
        if (insideTag) {
          errors.push({
            line: lineNum,
            message: `Nested tag <${tagName}> inside unclosed <${insideTag}> tag`,
            severity: 'error',
          });
        }
        insideTag = tagName;
        tagOpenLine[tagName] = lineNum;
        return;
      }

      const closeTagMatch = trimmed.match(/^<\/([a-zA-Z0-9_-]+)>$/);
      if (closeTagMatch) {
        const tagName = closeTagMatch[1];
        if (insideTag !== tagName) {
          errors.push({
            line: lineNum,
            message: `Mismatched closing tag </${tagName}>; currently inside <${insideTag || 'none'}>`,
            severity: 'error',
          });
        } else {
          insideTag = null;
          delete tagOpenLine[tagName];
        }
        return;
      }

      // If inside inline certificate/key block, do not parse as regular directives
      if (insideTag) {
        return;
      }

      // Parse tokens
      const parts = trimmed.split(/\s+/);
      const directive = parts[0].toLowerCase();

      // Check required directives flags
      if (directive === 'client' || directive === 'tls-client') foundClient = true;
      if (directive === 'dev') foundDev = true;
      if (directive === 'proto') foundProto = true;
      if (directive === 'remote') foundRemote = true;

      // 1. Directive validity check
      if (!VALID_OPENVPN_DIRECTIVES.has(directive)) {
        errors.push({
          line: lineNum,
          message: `Unknown or unrecognized OpenVPN directive '${directive}'`,
          severity: 'error',
          directive,
        });
        return;
      }

      // 2. Specific syntax checks per directive
      if (directive === 'remote') {
        if (parts.length < 2) {
          errors.push({
            line: lineNum,
            message: `Directive 'remote' requires at least a host or IP parameter (e.g., 'remote vpn.example.com 1194')`,
            severity: 'error',
            directive,
          });
        } else if (parts.length >= 3) {
          const portNum = parseInt(parts[2], 10);
          if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            errors.push({
              line: lineNum,
              message: `Invalid port number '${parts[2]}' in remote directive (must be 1-65535)`,
              severity: 'error',
              directive,
            });
          }
        }
      } else if (directive === 'proto') {
        const validProtos = ['udp', 'tcp', 'tcp-client', 'udp4', 'tcp4', 'udp6', 'tcp6'];
        if (parts.length < 2) {
          errors.push({
            line: lineNum,
            message: `Directive 'proto' missing protocol argument (e.g. 'proto udp' or 'proto tcp')`,
            severity: 'error',
            directive,
          });
        } else if (!validProtos.includes(parts[1].toLowerCase())) {
          errors.push({
            line: lineNum,
            message: `Invalid protocol '${parts[1]}' (allowed: ${validProtos.join(', ')})`,
            severity: 'error',
            directive,
          });
        }
      } else if (directive === 'dev') {
        if (parts.length < 2) {
          errors.push({
            line: lineNum,
            message: `Directive 'dev' requires a device type (e.g., 'dev tun' or 'dev tap')`,
            severity: 'error',
            directive,
          });
        } else if (!parts[1].toLowerCase().startsWith('tun') && !parts[1].toLowerCase().startsWith('tap')) {
          errors.push({
            line: lineNum,
            message: `Device '${parts[1]}' should start with 'tun' (routed) or 'tap' (bridged)`,
            severity: 'warning',
            directive,
          });
        }
      } else if (directive === 'cipher') {
        if (parts.length < 2) {
          errors.push({
            line: lineNum,
            message: `Directive 'cipher' requires a cipher name (e.g., 'cipher AES-256-GCM')`,
            severity: 'error',
            directive,
          });
        } else {
          const cipherUpper = parts[1].toUpperCase();
          if (cipherUpper === 'BF-CBC' || cipherUpper === 'DES' || cipherUpper === '3DES') {
            errors.push({
              line: lineNum,
              message: `Cipher '${parts[1]}' is deprecated and insecure. Recommend AES-256-GCM or AES-128-GCM`,
              severity: 'warning',
              directive,
            });
          }
        }
      } else if (directive === 'dhcp-option') {
        if (parts.length < 3) {
          errors.push({
            line: lineNum,
            message: `Directive 'dhcp-option' requires type and value (e.g., 'dhcp-option DNS 1.1.1.1')`,
            severity: 'error',
            directive,
          });
        }
      }
    });

    // Check for unclosed XML tags at EOF
    if (insideTag) {
      errors.push({
        line: tagOpenLine[insideTag] || rawLines.length,
        message: `Unclosed tag <${insideTag}> (missing matching </${insideTag}> before end of file)`,
        severity: 'error',
      });
    }

    // Check overall profile completeness
    if (!foundClient) {
      errors.push({
        line: 1,
        message: `Missing 'client' directive (required for client mode VPN profiles)`,
        severity: 'error',
      });
    }
    if (!foundDev) {
      errors.push({
        line: 1,
        message: `Missing 'dev tun' directive (required for Android TUN interface)`,
        severity: 'error',
      });
    }
    if (!foundProto) {
      errors.push({
        line: 1,
        message: `Missing 'proto' directive (e.g., 'proto udp' or 'proto tcp')`,
        severity: 'error',
      });
    }
    if (!foundRemote) {
      errors.push({
        line: 1,
        message: `Missing 'remote' directive specifying destination VPN gateway`,
        severity: 'error',
      });
    }

    const fatalErrors = errors.filter(e => e.severity === 'error');
    const warnings = errors.filter(e => e.severity === 'warning');

    return {
      isValid: fatalErrors.length === 0,
      errors,
      fatalErrors,
      warnings,
      rawLines,
    };
  }, [content]);

  if (!isOpen) return null;

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Triggered by the explicit 'Validate' button
  const handleValidateClick = () => {
    if (validationResult.isValid) {
      showToast(
        'success',
        'Syntax Validation Passed',
        `All OpenVPN directives are valid! Found ${validationResult.rawLines.length} lines, remote endpoint verified, and 0 syntax errors.`
      );
    } else {
      const topError = validationResult.fatalErrors[0];
      showToast(
        'error',
        'Syntax Validation Failed',
        `Found ${validationResult.fatalErrors.length} error(s). Line ${topError.line}: ${topError.message}`
      );
      setIsDiagnosticsOpen(true);
      setActiveHighlightLine(topError.line);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!validationResult.isValid) {
      const proceed = window.confirm(
        `Warning: There are ${validationResult.fatalErrors.length} syntax error(s) in this profile. Save anyway?`
      );
      if (!proceed) return;
    }

    onSave({
      ...server,
      rawConfig: content,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
    showToast('success', 'Configuration Saved', `Saved updates to app/src/main/assets/servers/${server.filename}`);
  };

  // Quick fix helper to add missing essential directives
  const handleAutoFix = () => {
    let updated = content;
    const additions: string[] = [];

    if (!updated.includes('client') && !updated.includes('tls-client')) {
      additions.push('client');
    }
    if (!updated.includes('dev tun') && !updated.includes('dev tap')) {
      additions.push('dev tun');
    }
    if (!updated.includes('proto udp') && !updated.includes('proto tcp')) {
      additions.push(`proto ${server.protocol || 'udp'}`);
    }
    if (!updated.includes('remote ')) {
      additions.push(`remote ${server.host} ${server.port}`);
    }
    if (!updated.includes('resolv-retry')) {
      additions.push('resolv-retry infinite');
    }
    if (!updated.includes('nobind')) {
      additions.push('nobind');
    }
    if (!updated.includes('persist-key')) {
      additions.push('persist-key');
    }
    if (!updated.includes('persist-tun')) {
      additions.push('persist-tun');
    }

    if (additions.length > 0) {
      updated = additions.join('\n') + '\n\n' + updated;
      setContent(updated);
      showToast('success', 'Directives Injected', `Appended ${additions.length} missing OpenVPN directive(s).`);
    } else {
      showToast('success', 'Clean Profile', 'All primary directives are already present.');
    }
  };

  // Map errors to line numbers for fast gutter lookup
  const errorsByLine = new Map<number, ValidationError>();
  validationResult.errors.forEach(err => {
    if (!errorsByLine.has(err.line)) {
      errorsByLine.set(err.line, err);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Toast Notification */}
        {toast && (
          <div className="absolute top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-3 duration-200 shadow-xl">
            <div className={`p-4 rounded-xl border flex items-start gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200 shadow-emerald-950/40'
                : 'bg-rose-950/95 border-rose-500/60 text-rose-200 shadow-rose-950/40'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                  {toast.title}
                </h4>
                <p className="text-xs mt-0.5 leading-relaxed text-slate-300">
                  {toast.message}
                </p>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">{server.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white truncate">{server.filename}</h3>
                {isServerBdixOptimized(server) && (
                  <BdixBadge variant="glow" />
                )}
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 shrink-0">
                  {server.protocol.toUpperCase()} {server.port}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate">
                app/src/main/assets/servers/{server.filename}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-time Syntax Validate Button */}
            <button
              onClick={handleValidateClick}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
                validationResult.isValid
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30 animate-pulse'
              }`}
              title="Run OpenVPN syntax verification scan"
            >
              {validationResult.isValid ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>Validate</span>
              {validationResult.fatalErrors.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px]">
                  {validationResult.fatalErrors.length}
                </span>
              )}
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => downloadSingleConfigFile(server)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Syntax Status Bar */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              {validationResult.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span className={validationResult.isValid ? 'text-emerald-400 font-medium' : 'text-rose-400 font-bold'}>
                {validationResult.isValid
                  ? 'Real-Time Syntax: Valid'
                  : `Syntax Error: ${validationResult.fatalErrors.length} issue(s) detected`}
              </span>
            </span>

            {validationResult.warnings.length > 0 && (
              <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                <AlertTriangle className="w-3 h-3" />
                <span>{validationResult.warnings.length} warning(s)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono text-slate-400 text-[11px]">
            <span>{validationResult.rawLines.length} lines</span>
            <span>·</span>
            <span>{content.length} bytes</span>
            
            {validationResult.fatalErrors.length > 0 && (
              <button
                onClick={handleAutoFix}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded text-xs transition-colors"
              >
                <Wand2 className="w-3 h-3" />
                <span>Auto-fix Missing Fields</span>
              </button>
            )}

            <button
              onClick={() => setIsDiagnosticsOpen(!isDiagnosticsOpen)}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Issues ({validationResult.errors.length})</span>
              {isDiagnosticsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Collapsible Diagnostics Tray */}
        {isDiagnosticsOpen && validationResult.errors.length > 0 && (
          <div className="bg-slate-950/95 border-b border-slate-800 px-5 py-2.5 max-h-36 overflow-y-auto font-mono text-xs space-y-1.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Live Syntax Audit Diagnostics
            </div>
            {validationResult.errors.map((err, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveHighlightLine(err.line)}
                className={`p-1.5 rounded flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  err.severity === 'error'
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-900/50 hover:bg-rose-900/40'
                    : 'bg-amber-950/40 text-amber-300 border border-amber-900/50 hover:bg-amber-900/40'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {err.severity === 'error' ? (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="font-bold shrink-0">Line {err.line}:</span>
                  <span className="truncate">{err.message}</span>
                </div>
                <span className="text-[10px] uppercase font-semibold shrink-0 px-1.5 py-0.2 rounded bg-black/40">
                  {err.severity}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Code Editor Area with Line-by-Line Gutter Indicators */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs flex min-h-[320px]">
          
          {/* Gutter with line numbers and error badges */}
          <div className="select-none text-slate-600 text-right pr-3 border-r border-slate-800 leading-relaxed font-mono shrink-0">
            {validationResult.rawLines.map((_, i) => {
              const lineNum = i + 1;
              const hasErr = errorsByLine.get(lineNum);
              const isSelected = activeHighlightLine === lineNum;

              return (
                <div 
                  key={i} 
                  className={`flex items-center justify-end gap-1.5 px-1 rounded transition-colors ${
                    isSelected
                      ? 'bg-rose-500/30 text-rose-200 font-bold'
                      : hasErr
                      ? hasErr.severity === 'error'
                        ? 'text-rose-400 font-bold bg-rose-950/40'
                        : 'text-amber-400 font-bold bg-amber-950/30'
                      : ''
                  }`}
                  title={hasErr ? `${hasErr.severity.toUpperCase()}: ${hasErr.message}` : undefined}
                >
                  {hasErr && (
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      hasErr.severity === 'error' ? 'bg-rose-500' : 'bg-amber-500'
                    }`} />
                  )}
                  <span>{lineNum}</span>
                </div>
              );
            })}
          </div>

          {/* Interactive Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-transparent text-slate-200 pl-4 resize-none focus:outline-none font-mono leading-relaxed selection:bg-emerald-500/30 w-full min-h-[300px]"
            spellCheck={false}
            placeholder="# OpenVPN client configuration file..."
          />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target: <code className="text-slate-200">app/src/main/assets/servers/{server.filename}</code></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {savedNotice && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Saved to Asset Memory!
              </span>
            )}

            <button
              onClick={handleValidateClick}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              Re-scan Syntax
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                validationResult.isValid
                  ? 'text-slate-950 bg-emerald-400 hover:bg-emerald-300'
                  : 'text-white bg-rose-600 hover:bg-rose-500'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{validationResult.isValid ? 'Save Changes' : 'Save with Warnings'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
