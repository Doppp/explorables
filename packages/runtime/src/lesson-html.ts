export function lessonBodyHtml(html: string, title: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  const firstElement = template.content.firstElementChild;
  if (
    firstElement?.tagName === "H1" &&
    firstElement.textContent?.trim() === title.trim()
  )
    firstElement.remove();
  return template.innerHTML;
}
