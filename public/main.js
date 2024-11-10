function toggleButton(button, label, isPid = false) {
    button.addEventListener("click", () => {
        const isOn = button.getAttribute("data-state") === "on";
        button.setAttribute("data-state", isOn ? "off" : "on");
        label.innerText = isPid
            ? `PID: ${isOn ? "OFF" : "ON"}`
            : `${isOn ? "OFF" : "ON"}`;
    });
}

window.onload = function () {
    const toggleOnOff = document.getElementById("toggleOnOff");
    const labelOnOff = document.getElementById("labelOnOff");
    toggleButton(toggleOnOff, labelOnOff);
};
