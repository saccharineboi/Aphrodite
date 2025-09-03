type CodeType = "KeyW" | "KeyS" | "KeyA" | "KeyD";

export class Input {
    private state: Map<string, boolean>;

    public constructor(elem: HTMLElement) {
        this.state = new Map();
        elem.addEventListener("keydown", e => {
            this.state.set(e.code, true);
        });
        elem.addEventListener("keyup", e => {
            this.state.set(e.code, false);
        });
        elem.addEventListener("click", () => elem.focus());
    }

    public isPressed(code: CodeType): boolean {
        const res = this.state.get(code);
        return res ? true : false;
    }
};
