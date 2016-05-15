class DashboardController < ApplicationController
  before_filter :authenticate_user!

  def index
    @monitors = RagiosMonitor.where(user_id: current_user)
    add_breadcrumb "All Monitors", dashboard_index_path
  end

  def monitor
    @monitor = RagiosMonitor.where(user_id: current_user, id: params[:id]).first
    add_breadcrumb "All Monitors", dashboard_index_path
    add_breadcrumb @monitor.title.to_s, monitor_dashboard_path
  end
end
