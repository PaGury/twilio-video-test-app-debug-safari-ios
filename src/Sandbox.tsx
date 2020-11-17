import React, { FunctionComponent, useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export {}

interface Props {
  style?: React.CSSProperties;
  innerStyle?: string;
  stylesheets?: string[];
  className?: string;
  name?: string;
  title: string;
}

interface State {
  iframeLoaded: boolean;
}

const defaultContext = {
  window,
  document,
};

const SandboxContext = React.createContext(defaultContext);
export type SandboxContextType = typeof defaultContext;

SandboxContext.displayName = 'SandboxContext';

export const SandboxContextConsumer = SandboxContext.Consumer;

const getContextFromIframe = (iframe: HTMLIFrameElement | null) =>
  iframe
    ? {
        window: iframe.contentWindow! as Window & typeof globalThis,
        document: iframe.contentDocument!,
      }
    : defaultContext;

const Sandbox: FunctionComponent<Props> = ({
  stylesheets = [],
  innerStyle = '',
  style,
  name,
  title,
  className,
  children,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const innerStyleRef = useRef(innerStyle);
  const [state, setState] = useState<State>({
    iframeLoaded: false,
  });
  useEffect(() => {
    if (!state.iframeLoaded || innerStyle === innerStyleRef.current) {
      return;
    }
    const { head } = iframeRef.current!.contentDocument!;
    const innerStyleTag = head.querySelector('#innerStyle')!;
    innerStyleTag.innerHTML = innerStyle;
  }, [innerStyle]);

  useEffect(() => {
    const iframe = iframeRef.current!;
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('seamless', '');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');

    const loadIframe = () => {
      const { contentWindow } = iframe;
      if (contentWindow) {
        const links = stylesheets
          .map(
            stylesheet =>
              `<link type="text/css" rel="stylesheet" href=${stylesheet}>`
          )
          .join('\n');

        contentWindow.document.open('text/html', 'replace');
        contentWindow.document.write(`
  <!DOCTYPE html>
  <html style="height: 100%; width: 100%;">
    <head>
      <!-- Used to prevent fetching not necessary favicon -->
      <link rel="icon" href="data:;base64,iVBORw0KGgo=">
      ${links}
      <style id="innerStyle">${innerStyle}</style>
      <style>html { font-size: .625em; font-size: calc(1em * .625); }</style>
    </head>
    <body style="height: 100%; width: 100%; margin: 0;">
      <script>
        // Safari does not like onLoad event when no src is provided to an iframe
        // We have to manually trigger event to notify parent that the iframe is loaded
        setTimeout(function() { window.postMessage('loaded', '${document.location.href}') }, 0);
      </script>
    </body>
  </html>
  `);
        contentWindow.document.close();
        contentWindow.addEventListener(
          'message',
          () => setState({ iframeLoaded: true }),
          false
        );
      }
    };

    const isIframeLoaded = iframe.contentWindow !== null;

    if (isIframeLoaded) {
      loadIframe();
    } else {
      iframe.onload = loadIframe;
    }
  }, []);

  return (
    <iframe
      className={className}
      ref={iframeRef}
      style={style}
      name={name}
      title={title}
    >
      {state.iframeLoaded &&
        ReactDOM.createPortal(
          <SandboxContext.Provider
            value={getContextFromIframe(iframeRef.current)}
          >
            {children}
          </SandboxContext.Provider>,
          iframeRef.current!.contentDocument!.body as HTMLElement
        )}
    </iframe>
  );
};

export default Sandbox;
