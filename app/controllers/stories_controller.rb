class StoriesController < ApplicationController
  def new
  end

  def create
    client = OpenAI::Client.new(access_token: Rails.application.credentials.openai[:api_key])

    # Prepare the prompt with user inputs
    response = client.chat(
      parameters: {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'ユーザーが入力した設定で、面白おかしく展開を予想して適当な短編物語を書いて。' },
          { role: 'user', content: "もしも #{params[:first_input]} が #{params[:second_input]} だったら" },
        ],
        max_tokens: 2000,
      }
    )
    @story = response.dig('choices', 0, 'message', 'content').strip
    render json: { story: @story }
  end
end
