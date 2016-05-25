$(function() {
  'use strict';

  var getMonitorId = _.memoize(function () {
    return $("#monitor-info").data("monitor-id");
  });
  var vent = _.extend({}, Backbone.Events);
  var eventsUrl = $("#monitor-info").data("events-url");
  var findMonitorUrl = $("#monitor-info").data("find-monitor-url");
  var testUrl = $("#monitor-info").data("test-url");
  var startUrl = $("#monitor-info").data("start-url");
  var stopUrl = $("#monitor-info").data("stop-url");
  var restfulUrl = $("#monitor-info").data("restful-url");
  var dashboardUrl = $("#monitor-info").data("dashboardUrl");

  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  var Util = {
    init: function () {
      this.message = $("#message");
	    this.messageTemplate = _.template( $('#message-template').html() );
    },
    success: function (data) {
      Util.message.append(
        Util.messageTemplate({message: "Success", alert: "success", response: JSON.stringify(data)})
      );
      vent.trigger("data:refresh", "change-all");
    },
    error: function ( xhr ) {
      var response = $.parseJSON(xhr.responseText);
      Util.message.append(
        Util.messageTemplate({message: "Error", alert: "danger", response: JSON.stringify(response)})
      );
    }
  }

  var monitor = {
    init: function () {
    	this.$el = $("#monitor-details");
    	this.$form = $("#monitor-form");
    	this.template = _.template( $('#monitor-details-template').html() );
      this.find();
    },
    createEditor: function () {

    },
    render: function (data) {
      monitor.$el.html(
        monitor.template(data)
      );
    },
    update: function () {
      var data = {};
      monitor.$form.serializeArray().map(function(i){data[i.name] = i.value;});
      console.log(data)
      var attributesJson = JSON.stringify( data );
      ragios.update( restfulUrl, attributesJson, Util.success, Util.error );
    },
    find: function () {
      ragios.find( findMonitorUrl, this.render, Util.error );
    },
    start: function () {
      if( ragiosHelper.confirm("Are you sure you want to start this monitor?") ) {
        ragios.start( startUrl, Util.success, Util.error );
      }
    },
    stop: function () {
      if( ragiosHelper.confirm("Are you sure you want to stop this monitor?") ) {
        ragios.stop( stopUrl, Util.success, Util.error );
      }
    },
    test: function () {
      if( ragiosHelper.confirm("Are you sure you want to test this monitor?") ) {
        ragios.test( testUrl, Util.success, Util.error);
      }
    },
    delete: function () {
      if( ragiosHelper.confirm("Are you sure you want to delete this monitor?") ) {
        var deleteSuccess = function () {
          ragiosHelper.redirect_to(dashboardUrl);
        };
        ragios.delete( restfulUrl, deleteSuccess, Util.error );
      }
    }
  };


  var EventTable = {
    create: function(tableSelector) {
      return Object.create(this).init(tableSelector)
    },
    init: function(tableSelector) {
      this.tableSelector = $(tableSelector);
      return this;
    },
    buildTable: function () {
      this.reset(
        this.createTable
      );
    },
    refreshTable: function () {
      this.reset(
        this.redoTableEvt
      );
    },
    dataChanged: function () {
      this.reset(
        this.reloadTable
      );
    }
  }

  var allEvents = EventTable.create(
    '#all-events-datatable'
  );
  _.extend(allEvents, {
    reset: function(renderTable) {
      ragios.getEvents(
        eventsUrl,
        renderTable,
        Util.error
      );
    },
    createTable: function(data) {
      allEvents.table =
      allEvents.tableSelector.dataTable({
      	"bFilter": false,
        "bStateSave": true,
        "order": [ 0, 'desc' ],
        "data": allEvents.cleanData(data),
        "columns": allEvents.columns(),
        "aLengthMenu": [[5, 10, 15, -1], [5, 10, 15, 20]],
        "iDisplayLength": 5
      });
    },
    reloadTable: function (data) {
      allEvents.table.fnClearTable();
      if(data.length > 0 ) { allEvents.table.fnAddData( allEvents.cleanData(data) ); }
    },
    redoTableEvt: function (data) {
      allEvents.reloadTable(data)
      vent.trigger("data:refresh", "all-events");
    },
    columns: function () {
      return [
        { "data": "time", "width": "10%" },
        { "data": "event_type", "width": "5%" },
        { "data": "state", "width": "5%" },
        { "data": "event", "width": "20%" }
      ]
    },
    cleanData: function (data) {
      return _.map(data, function(data) {
        return {
          time: ragiosHelper.formatDate(data.time),
          event_type: data.event_type,
          state: ragiosHelper.formatState(data.state),
          event: ragiosHelper.formatResults(data.event)
        };
      });
    }
  });

  $( "#start-button" ).on("click", function() { monitor.start(); });
  $( "#stop-button" ).on("click", function() { monitor.stop(); });
  $( "#test-button" ).on("click", function() { monitor.test(); });
  $( "#delete-button" ).on("click", function() { monitor.delete(); });
  $( "#update-monitor-button" ).on("click", function() { monitor.update(); });

  Util.init();
  monitor.init();
  allEvents.buildTable();
});
