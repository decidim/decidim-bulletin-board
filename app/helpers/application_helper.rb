# frozen_string_literal: true

require "redcarpet"

module ApplicationHelper
  def render_doc(file)
    md_render File.read(Rails.root.join("docs", "#{file}.md"))
  end

  def md_render(text)
    text = Redcarpet::Markdown.new(markdown, autolink: true, tables: true, fenced_code_blocks: true).render(text)
    text.html_safe
  end

  def markdown
    @markdown ||= Redcarpet::Render::HTML.new
  end
end
