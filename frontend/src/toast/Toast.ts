class Toast {
    private static container: HTMLDivElement;
    private static defaultDuration = 5000;

    static init() {
        this.container = document.createElement("div");
        this.container.id = "toast-container";
        Object.assign(this.container.style, {
            position: "fixed",
            top: "1em",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: "9999",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "none",
            maxWidth: "calc(100% - 2em)",
            width: "auto",
            gap: "0.5em",
        });
        document.body.appendChild(this.container);
    }

    static show(message: string, type: "success" | "warn" | "error", duration = this.defaultDuration) {
        if (!this.container) this.init();

        const toast = document.createElement("div");
        const progressBar = document.createElement("div");
        const toastId = Date.now().toString();
        
        toast.id = toastId;
        toast.className = `toast ${type}`;
        
        Object.assign(toast.style, {
            minWidth: "350px",
            maxWidth: "400px",
            margin: "0 1em",
            padding: "16px 24px",
            borderRadius: "6px",
            boxShadow: "0 1px 10px 0 rgba(0, 0, 0, 0.1), 0 2px 15px 0 rgba(0, 0, 0, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "16px",
            fontFamily: "inherit",
            color: "#fff",
            opacity: "0",
            transform: "translateY(-100%)",
            transition: "all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)",
            pointerEvents: "all",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
        });

        Object.assign(progressBar.style, {
            position: "absolute",
            bottom: "0",
            left: "0",
            width: "100%",
            height: "4px",
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            transformOrigin: "left",
            transform: "scaleX(1)",
            transition: `transform linear ${duration}ms`,
        });

        const typeStyles = {
            success: { background: "#4CAF50" },
            warn: { background: "#FFA000" },
            error: { background: "#D32F2F" }
        };
        Object.assign(toast.style, typeStyles[type]);

        const messageSpan = document.createElement("span");
        messageSpan.textContent = message;
        toast.appendChild(messageSpan);

        const closeButton = document.createElement("button");
        closeButton.innerHTML = "&times;";
        Object.assign(closeButton.style, {
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "24px",
            cursor: "pointer",
            marginLeft: "20px",
            padding: "0",
            opacity: "0.8",
            alignSelf: "flex-start",
        });
        
        closeButton.onmouseenter = () => closeButton.style.opacity = "1";
        closeButton.onmouseleave = () => closeButton.style.opacity = "0.8";
        closeButton.onclick = () => this.removeToast(toast);

        toast.appendChild(closeButton);
        toast.appendChild(progressBar);
        this.container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
            progressBar.style.transform = "scaleX(0)";
        });

        let timeoutId: ReturnType<typeof setTimeout>;
        const startTimeout = () => {
            timeoutId = setTimeout(() => this.removeToast(toast), duration);
        };

        toast.addEventListener("mouseenter", () => {
            clearTimeout(timeoutId);
            progressBar.style.transition = "none";
            progressBar.style.transform = `scaleX(${
                (progressBar.getBoundingClientRect().width / toast.offsetWidth).toFixed(2)
            })`;
        });

        toast.addEventListener("mouseleave", () => {
            const remainingWidth = progressBar.getBoundingClientRect().width;
            const remainingTime = (remainingWidth / toast.offsetWidth) * duration;
            
            progressBar.style.transition = `transform linear ${remainingTime}ms`;
            progressBar.style.transform = "scaleX(0)";
            startTimeout();
        });

        startTimeout();
    }

    private static removeToast(toast: HTMLDivElement) {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-100%)";
        setTimeout(() => toast.remove(), 300);
    }
}

export default Toast;