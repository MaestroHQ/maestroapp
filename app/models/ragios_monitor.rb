class RagiosMonitor < ActiveRecord::Base
  belongs_to :user
  has_many :email_notifiers

  STATUSES = %w(pending active cannot_create)

  def self.status(value)
    STATUSES.index(value.to_s)
  end

  def self.client
    @ragios_client ||= Ragios::Client.new(
      username: ENV["RAGIOS_SERVER_USERNAME"],
      password: ENV["RAGIOS_SERVER_PASSWORD"],
      address: ENV["RAGIOS_SERVER_URL"],
      port: ENV["RAGIOS_SERVER_PORT"]
    )
  end
end
