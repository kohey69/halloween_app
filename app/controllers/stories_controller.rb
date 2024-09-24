class StoriesController < ApplicationController
  def new
  end

  def create
    client = OpenAI::Client.new(access_token: Rails.application.credentials.openai[:api_key])

    system_prompt = <<~PROMPT
      ユーザーが入力した設定で、面白おかしく展開を予想して適当な短編物語を書いて。
      文章はHTMLでフォーマットして、htmlタグやheadタグなどは無しで、h1タグとdivタグとpタグを使ってください。
    PROMPT
    user_prompt = "もしも #{params[:first_input]} が #{params[:second_input]} だったら"

    text_response = client.chat(
      parameters: {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: system_prompt },
          { role: 'user', content: user_prompt },
        ],
        max_tokens: 2000,
      }
    )
    @story = text_response.dig('choices', 0, 'message', 'content').strip

    image_prompt = <<~PROMPT
      以下の設定で漫画風の画像を生成してください。
      #{@story}
    PROMPT
    image_response = client.images.generate(
      parameters: {
        prompt: image_prompt,
        model: 'dall-e-3',
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      }
    )
    @image_url = image_response.dig('data', 0, 'url')

    render json: { story: @story, image_url: @image_url }
  rescue Faraday::BadRequestError => e
    render json: { error: e.message, details: e.response_body }, status: :bad_request
  end
end
