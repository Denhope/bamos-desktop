import { ipcRenderer, contextBridge } from 'electron';

// Explicitly annotate the parameter types for withPrototype
function withPrototype(obj: Record<string, any>): Record<string, any> {
  const protos = Object.getPrototypeOf(obj);

  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) continue;

    if (typeof value === 'function') {
      obj[key] = function (...args: any[]) {
        return value.call(obj, ...args);
      };
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

// Explicitly annotate the return type for domReady
function domReady(
  condition: DocumentReadyState[] = ['complete', 'interactive']
): Promise<boolean> {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

// Explicitly annotate the parameter types for safeDOM.append and safeDOM.remove
const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement): HTMLElement | null {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
    return null;
  },
  remove(parent: HTMLElement, child: HTMLElement): HTMLElement | null {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
    return null;
  },
};

// Explicitly annotate the return type for useLoading
type LoadingMethods = {
  appendLoading: () => void;
  removeLoading: () => void;
};

function useLoading(): LoadingMethods {
  const className = `loaders-css__letter-spin`;
  const styleContent = `
@keyframes letter-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.${className} {
  font-size: 50px;
  color: #fff;
  animation: letter-spin 2s linear infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
  `;
  const oStyle = document.createElement('style');
  const oDiv = document.createElement('div');

  oStyle.id = 'app-loading-style';
  oStyle.innerHTML = styleContent;
  oDiv.className = 'app-loading-wrap';
  oDiv.innerHTML = `<div class="${className}">B</div>`;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// Explicitly annotate the return type for the contextBridge.exposeInMainWorld
contextBridge.exposeInMainWorld('ipcRenderer', withPrototype(ipcRenderer));

// Explicitly annotate the return type for useLoading
const { appendLoading, removeLoading } = useLoading();

// Explicitly annotate the return type for domReady
domReady().then(appendLoading);

// Explicitly annotate the event listener for window.onmessage
window.onmessage = (ev: MessageEvent) => {
  if (ev.data.payload === 'removeLoading') {
    removeLoading();
  }
};

// Explicitly annotate the setTimeout call
setTimeout(removeLoading, 4999);
