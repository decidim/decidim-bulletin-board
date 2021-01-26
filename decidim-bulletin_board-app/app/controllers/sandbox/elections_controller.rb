# frozen_string_literal: true

module Sandbox
  class ElectionsController < ApplicationController
    helper_method :elections, :election

    def index; end

    def key_ceremony; end

    def tally; end

    private

    def elections
      @elections ||= Election.all
    end

    def election
      @election ||= elections.find(params[:id])
    end
  end
end
