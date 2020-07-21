# frozen_string_literal: true

require "rails_helper"

Rails.application.load_tasks

describe "client.rake" do
  after(:each) do
    Rake.application["client:add_authority"].reenable
  end

  it "creates a new authority" do
    output = capture_output("client:add_authority", "Decidim Barcelona", "public_key")
    expect(output.index(/Authority 'Decidim Barcelona' successfuly added!/)).to be_truthy
  end
  it "returns message of existing authority" do
    authority = create(:authority)
    output = capture_output("client:add_authority", authority.name, authority.public_key)
    expect(output.index(/The authority already exists!/)).to be_truthy
    expect(output.index(authority.api_key)).to be_truthy
  end
end

def capture_output(task_name, name, public_key)
  stdout = StringIO.new
  $stdout = stdout
  Rake::Task[task_name].invoke(name, public_key)
  $stdout = STDOUT
  return stdout.string
end