import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="story-generator"
export default class extends Controller {
  static targets = ["output", "overlay", "form", "skeleton", "loadingMessage"];
  loadingInterval = null;

  submit(event) {
    event.preventDefault();
    this.startLoadingAnimation();
    this.overlayTarget.classList.remove("d-none");
    this.skeletonTarget.classList.remove("d-none");
    this.formTarget.classList.add("d-none");

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
        this.stopLoadingAnimation();
        console.log(data.story_text)
        this.overlayTarget.classList.add("d-none");
        this.outputTarget.insertAdjacentHTML("afterbegin", `<img src="${data.image_url}" alt="生成した画像">`);
        this.outputTarget.insertAdjacentHTML("afterbegin", data.story);
        this.skeletonTarget.classList.add("d-none");
        this.outputTarget.classList.remove("d-none");
      })
      .catch(error => {
        this.stopLoadingAnimation();
        this.overlayTarget.classList.add("d-none");
        this.outputTarget.insertAdjacentHTML("afterbegin", `<p>Error generating story: ${error}</p>`);
        this.skeletonTarget.classList.add("d-none");
        this.outputTarget.classList.remove("d-none");
      });
  }

  startLoadingAnimation() {
    const loadingStates = ["生成しています.", "生成しています..", "生成しています..."];
    let index = 0;
    this.loadingInterval = setInterval(() => {
      this.loadingMessageTarget.innerText = loadingStates[index];
      index = (index + 1) % loadingStates.length; // 0, 1, 2を繰り返す
    }, 500); // 0.5秒ごとに変更
  }

  stopLoadingAnimation() {
    clearInterval(this.loadingInterval);
    this.loadingMessageTarget.innerText = "生成しています"; // 終了時の固定メッセージ
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
