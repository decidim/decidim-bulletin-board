# frozen_string_literal: true

require "redcarpet"

module ApplicationHelper
  def render_doc(file)
    md_render Rails.root.join("docs", "#{file}.md").read
  end

  def md_render(text)
    text = Redcarpet::Markdown.new(markdown, autolink: true, tables: true, fenced_code_blocks: true).render(text)
    text.html_safe
  end

  def markdown
    Redcarpet::Render::HTML.new
  end
end
