// STATE MANAGER IMPROVEMENTS
let currentInstance: { id: symbol; props: {}; render: () => any; } | null = null;
const componentStates = new WeakMap();
const hookStates = new WeakMap();
const hookIndices = new WeakMap();
const cleanupFns = new WeakMap();

export function createComponent(renderFn: any) {
  return (props = {}) => {
    const instance = {
      id: Symbol('component'),
      props,
      render: function() {
        const prevInstance = currentInstance;
        currentInstance = instance;
        hookIndices.set(instance, 0);

        if (cleanupFns.has(instance)) {
          const cleanup = cleanupFns.get(instance);
          cleanup();
        }

        const dom = renderFn(instance.props);

        if (!componentStates.has(instance)) {
          componentStates.set(instance, dom);
        }

        currentInstance = prevInstance;
        return dom;
      }
    };
    
    const initialDom = instance.render();
    componentStates.set(instance, initialDom);
    return initialDom;
  };
}

export function useCleanup(cleanupFn: any) {
  if (!currentInstance) {
    throw new Error('useCleanup must be called within a component');
  }
  cleanupFns.set(currentInstance, cleanupFn);
}

export const StateManager = {
  useState(initialValue: any) {
    if (!currentInstance) {
      throw new Error('Hooks must be called within a component');
    }

    const currentHookIndex = hookIndices.get(currentInstance) || 0;
    const hookIndex = currentHookIndex;
    hookIndices.set(currentInstance, currentHookIndex + 1);

    if (!hookStates.has(currentInstance)) {
      hookStates.set(currentInstance, []);
    }
    const hooks = hookStates.get(currentInstance);
    const instance = currentInstance;

    if (hookIndex >= hooks.length) {
      hooks.push({
        state: typeof initialValue === 'function' 
          ? initialValue(instance.props) 
          : initialValue,
        setState: (newValue: any) => {
          const prevState = hooks[hookIndex].state;
          const nextState = typeof newValue === 'function' 
            ? newValue(prevState) 
            : newValue;

          if (prevState !== nextState) {
            hooks[hookIndex].state = nextState;
            
            requestAnimationFrame(() => {
              const oldDom = componentStates.get(instance);
              if (oldDom && document.body.contains(oldDom)) {
                const newDom = instance.render();
                oldDom.replaceWith(newDom);
                componentStates.set(instance, newDom);
              }
            });
          }
        }
      });
    }

    return [hooks[hookIndex].state, hooks[hookIndex].setState];
  }
};
