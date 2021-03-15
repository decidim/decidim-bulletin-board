# frozen_string_literal: true

class PagesController < ApplicationController
  helper_method :name, :version, :public_key

  private

  delegate :name, :public_key, to: BulletinBoard

  def version
    Decidim::BulletinBoard::VERSION
  end
end
