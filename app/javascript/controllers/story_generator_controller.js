import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="story-generator"
export default class extends Controller {
  static targets = ["output", "spinner", "form"];

  connect() {
    this.spinnerTarget.style.display = "none";
  }

  submit(event) {
    event.preventDefault();
    this.outputTarget.innerHTML = "";
    this.spinnerTarget.style.display = "block";
    this.formTarget.style.display = "none";

    fetch(event.target.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
      },
      body: JSON.stringify({
        first_input: event.target.first_input.value,
        second_input: event.target.second_input.value,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        this.spinnerTarget.style.display = "none";
        this.outputTarget.innerHTML = this.simpleFormat(data.story);
      })
      .catch(error => {
        this.spinnerTarget.style.display = "none";
        this.outputTarget.innerHTML = `<p>Error generating story: ${error}</p>`;
      });
  }

  simpleFormat(text) {
    // 改行を <br> に変換し、全体を <p> タグで囲む
    const formattedText = text
      .split("\n\n") // 段落の分割
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
      .join("");
    return formattedText;
  }
}
