# frozen_string_literal: true

def stub_command(clazz, called_method, event_to_publish, *published_event_args)
  stub_const(clazz, Class.new(TestWisperPublisher) do
    define_method(called_method) do |*_args|
      publish(event_to_publish, *published_event_args)
    end

    define_method(:message_id) do
      "a.message+id"
    end

    define_method(:configure) { |*_args|; }
  end)
end
