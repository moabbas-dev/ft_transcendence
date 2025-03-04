import { createComponent } from "../../utils/StateManager.js";

interface InputHandlerProps {
  onKeyStateChange?: (keys: { [key: string]: boolean }) => void;
}

export const InputHandler = createComponent((props: InputHandlerProps) => {
  // Create a hidden element to attach the handler to
  const inputElement = document.createElement("div");
  inputElement.style.display = "none";
  
  // Key state object
  const keys: { [key: string]: boolean } = {};
  
  // Event handlers
  const handleKeyDown = (e: KeyboardEvent) => {
    keys[e.key] = true;
    if (props.onKeyStateChange) {
      props.onKeyStateChange(keys);
    }
  };
  
  const handleKeyUp = (e: KeyboardEvent) => {
    keys[e.key] = false;
    if (props.onKeyStateChange) {
      props.onKeyStateChange(keys);
    }
  };
  
  // Attach event listeners
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  
  // Method to get current key state
  const getKeyState = () => {
    return { ...keys };
  };
  
  // Method to check if a specific key is pressed
  const isKeyPressed = (key: string) => {
    return !!keys[key];
  };
  
  // Expose methods to the parent component
  (inputElement as any).getKeyState = getKeyState;
  (inputElement as any).isKeyPressed = isKeyPressed;
  
  // Cleanup function
  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
  
  (inputElement as any).destroy = cleanup;
  
  return inputElement;
});