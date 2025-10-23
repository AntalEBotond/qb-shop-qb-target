document.addEventListener("DOMContentLoaded", function () {
    const config = {
        StandardEyeIcon: "fas fa-eye",
        StandardColor: "var(--md-on-surface, white)",
        SuccessColor: "var(--md-success, #386a20)",
    };

    const targetEye = document.getElementById("target-eye");
    const targetLabel = document.getElementById("target-label");
    const TargetEyeStyleObject = targetEye.style;

    function OpenTarget() {
        // No central eye; only clear label area
        targetLabel.textContent = "";
    }

    function CloseTarget() {
        targetLabel.textContent = "";
        targetEye.style.display = "none";
    }

    function createTargetOption(index, itemData) {
        if (itemData !== null) {
            index = Number(index) + 1;
            const targetOption = document.createElement("div");
            targetOption.id = `target-option-${index}`;
            const targetIcon = document.createElement("span");
            targetIcon.id = `target-icon-${index}`;
            const icon = document.createElement("i");
            icon.className = itemData.icon;
            targetIcon.appendChild(icon);
            targetIcon.appendChild(document.createTextNode(" "));
            targetOption.appendChild(targetIcon);
            targetOption.appendChild(document.createTextNode(itemData.label));
            targetLabel.appendChild(targetOption);
        }
    }

    function findTargetOption(element) {
        let current = element;
        while (current && current !== document.body) {
            if (current.id && current.id.startsWith("target-option-")) {
                return current.id.split("-")[2];
            }
            current = current.parentElement;
        }
        return null;
    }

    function FoundTarget(item) {
        // Only render clickable options; no eye icon behavior
        targetLabel.textContent = "";
        for (let [index, itemData] of Object.entries(item.options)) {
            createTargetOption(index, itemData);
        }
    }

    function ValidTarget(item) {
        targetLabel.textContent = "";
        for (let [index, itemData] of Object.entries(item.data)) {
            createTargetOption(index, itemData);
        }
    }

    function LeftTarget() {
        // Clear options; eye is not used
        targetLabel.textContent = "";
    }

    function handleMouseDown(event) {
        if (event.button !== 2) {
            return;
        }

        event.preventDefault();

        const optionIndex = findTargetOption(event.target);
        if (optionIndex) {
            fetch(`https://${GetParentResourceName()}/selectTarget`, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: JSON.stringify(optionIndex),
            }).catch((error) => console.error("Error:", error));
            targetLabel.textContent = "";
            return;
        }

        LeftTarget();
        fetch(`https://${GetParentResourceName()}/leftTarget`, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: "",
        }).catch((error) => console.error("Error:", error));
    }

    function handleKeyDown(event) {
        if (event.key === "Escape" || event.key === "Backspace") {
            CloseTarget();
            fetch(`https://${GetParentResourceName()}/closeTarget`, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: "",
            }).catch((error) => console.error("Error:", error));
        }
    }

    window.addEventListener("message", function (event) {
        switch (event.data.response) {
            case "openTarget":
                OpenTarget();
                break;
            case "closeTarget":
                CloseTarget();
                break;
            case "foundTarget":
                FoundTarget(event.data);
                break;
            case "validTarget":
                ValidTarget(event.data);
                break;
            case "leftTarget":
                LeftTarget();
                break;
        }
    });

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleKeyDown);

    window.addEventListener("contextmenu", function (event) {
        event.preventDefault();
    });

    window.addEventListener("unload", function () {
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("keydown", handleKeyDown);
    });
});
