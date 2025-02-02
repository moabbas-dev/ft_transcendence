// STATE MANAGER IMPROVEMENTS
let currentInstance = null;
const componentStates = new WeakMap();
const hookStates = new WeakMap();
const hookIndices = new WeakMap();
const cleanupFns = new WeakMap();

export function createComponent(renderFn) {
  return (props = {}) => {
    const instance = {
      id: Symbol('component'),
      props,
      render: function() {
        const prevInstance = currentInstance;
        currentInstance = instance;
        hookIndices.set(instance, 0);
        
        // Run cleanup before new render
        if (cleanupFns.has(instance)) {
          const cleanup = cleanupFns.get(instance);
          cleanup();
        }
        
        const dom = renderFn(instance.props);
        
        // Store/update DOM reference
        if (!componentStates.has(instance)) {
          componentStates.set(instance, dom);
        }
        
        currentInstance = prevInstance;
        return dom;
      }
    };
    
    // Initial render and DOM storage
    const initialDom = instance.render();
    componentStates.set(instance, initialDom);
    return initialDom;
  };
}

export function useCleanup(cleanupFn) {
  if (!currentInstance) {
    throw new Error('useCleanup must be called within a component');
  }
  cleanupFns.set(currentInstance, cleanupFn);
}

export const StateManager = {
  useState(initialValue) {
    if (!currentInstance) {
      throw new Error('Hooks must be called within a component');
    }

    const currentHookIndex = hookIndices.get(currentInstance) || 0;
    // Capture the hook index so it won’t be affected by later calls
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
        // In StateManager's setState
        setState: (newValue) => {
          const prevState = hooks[hookIndex].state;
          const nextState = typeof newValue === 'function' 
            ? newValue(prevState) 
            : newValue;

          // Only update if state actually changed
          if (prevState !== nextState) {
            hooks[hookIndex].state = nextState;
            
            // Batch DOM updates
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
