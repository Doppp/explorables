import type { ExplorableModule } from "@explorables/explorable";

const fixture: ExplorableModule = {
  mount(root) {
    const output = document.createElement("output");
    output.textContent = "Persistent theme fixture state";
    root.append(output);
    return {};
  },
};

export default fixture;
