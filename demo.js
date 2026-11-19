(() => {
  "use strict";
  const items = [
    { name: "Прототип страницы", qty: 1, price: 12000 },
    { name: "Дизайн-концепция", qty: 1, price: 18000 },
    { name: "Адаптивный макет", qty: 1, price: 8000 }
  ];
  const money = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
  const byId = (id) => document.getElementById(id);

  function element(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderEditor() {
    const editor = byId("demo-items");
    editor.replaceChildren();
    items.forEach((item, index) => {
      const row = element("div");
      row.className = "demo-item";
      const fields = [["name", "Название услуги", "text"], ["qty", "Количество", "number"], ["price", "Цена", "number"]];
      fields.forEach(([field, label, type]) => {
        const input = document.createElement("input");
        input.type = type;
        input.value = item[field];
        input.setAttribute("aria-label", `${label}, строка ${index + 1}`);
        if (field === "name") input.className = "demo-name";
        if (type === "number") { input.min = "0"; input.step = "1"; }
        input.addEventListener("input", () => {
          item[field] = type === "number" ? Math.max(0, Number(input.value) || 0) : input.value;
          renderPreview();
        });
        row.append(input);
      });
      editor.append(row);
    });
  }

  function renderPreview() {
    byId("preview-demo-title").textContent = byId("demo-title").value.trim() || "Новый проект";
    byId("preview-demo-client").textContent = byId("demo-client").value.trim() || "Не указан";
    byId("preview-demo-provider").textContent = byId("demo-provider").value.trim() || "Не указан";
    const body = byId("preview-demo-items");
    body.replaceChildren();
    let total = 0;
    items.forEach((item) => {
      const sum = item.qty * item.price;
      total += sum;
      const row = element("tr");
      row.append(element("td", item.name.trim() || "Услуга"));
      row.append(element("td", String(item.qty)));
      row.append(element("td", money.format(item.price)));
      row.append(element("td", money.format(sum)));
      body.append(row);
    });
    byId("preview-demo-total").textContent = money.format(total);
  }

  ["demo-title", "demo-client", "demo-provider"].forEach((id) => byId(id).addEventListener("input", renderPreview));
  byId("demo-print").addEventListener("click", () => window.print());
  renderEditor();
  renderPreview();
})();
