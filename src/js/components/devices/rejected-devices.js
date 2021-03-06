import React from 'react';
import ReactDOM from 'react-dom';
import Time from 'react-time';
import { Motion, spring } from 'react-motion';
import Collapse from 'react-collapse';
import ReactHeight from 'react-height';
import { Router, Link } from 'react-router';
var Loader = require('../common/loader');
var AppActions = require('../../actions/app-actions');
var ExpandedDevice = require('./expanded-device');
var createReactClass = require('create-react-class');
var Pagination = require('rc-pagination');
var _en_US = require('rc-pagination/lib/locale/en_US');
var pluralize = require('pluralize');
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import { preformatWithRequestID } from '../../helpers.js';


// material ui
var mui = require('material-ui');
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import InfoIcon from 'react-material-icons/icons/action/info-outline';
import Dialog from 'material-ui/Dialog';
import { List, ListItem } from 'material-ui/List';

var Rejected =  createReactClass({
  getInitialState: function() {
    return {
      minHeight: 200,
      divHeight: 178,
      devices: [],
      pageNo: 1,
      pageLength: 20,
      selectedRows: [],
      authLoading: "all",
      deviceToReject: {},
    }
  },

  componentDidMount() {
    clearAllRetryTimers();
    this._getDevices();
  },

  componentWillUnmount() {
    clearAllRetryTimers();
  },

  componentDidUpdate(prevProps, prevState) {

    if ((prevProps.count !== this.props.count)
      || ((prevProps.currentTab !== this.props.currentTab) && this.props.currentTab.indexOf("Rejected")) ) {
      this._getDevices();
      this._clearSelected();
    }
  },
  /*
  * Devices to show
  */ 
  _getDevices: function() {
    var self = this;
    var callback =  {
      success: function(devices) {
        self.setState({devices: devices, pageLoading: false, authLoading: null, deviceToReject:{}, expandRow: null});
        if (!devices.length && self.props.count) {
          //if devices empty but count not, put back to first page
          self._handlePageChange(1);
        }
        self._adjustHeight();
      },
      error: function(error) {
        console.log(err);
        var errormsg = err.error || "Please check your connection.";
        self.setState({pageLoading: false, authLoading: null, deviceToReject:{} });
        setRetryTimer(err, "devices", "Rejected devices couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
      }
    };
    AppActions.getDevicesByStatus(callback, "rejected", this.state.pageNo, this.state.pageLength);
  },

  _clearSelected: function() {
    this.setState({selectedRows:[], expandRow: null});
  },


  _adjustHeight: function () {
    // do this when number of devices changes
    var h = this.state.devices.length * 55;
    h += 200;
    this.setState({minHeight: h});
  },
  _sortColumn: function(col) {
    console.log("sort");
  },
  _expandRow: function(rowNumber) {
    AppActions.setSnackbar("");
    var device = this.state.devices[rowNumber];
    if (this.state.expandRow === rowNumber) {
      rowNumber = null;
    }
    device.id_data = device.attributes;
    this.setState({expandedDevice: device, expandRow: rowNumber});
    
  },
  _adjustCellHeight: function(height) {
    this.setState({divHeight: height+95});
  },

  _handlePageChange: function(pageNo) {
    var self = this;
    self.setState({selectedRows:[], pageLoading:true, expandRow: null, pageNo: pageNo}, () => {self._getDevices()});
  },

  _onRowSelection: function(selectedRows) {
    if (selectedRows === "all") {
      var rows = Array.apply(null, {length: this.state.devices.length}).map(Number.call, Number);
      this.setState({selectedRows: rows});
    } else if (selectedRows === "none") {
      this.setState({selectedRows: []});
    } else {
      this.setState({selectedRows: selectedRows});
    }
    
  },

  _isSelected: function(index) {
    return this.state.selectedRows.indexOf(index) !== -1;
  },

  _getDevicesFromSelectedRows: function() {
    // use selected rows to get device from corresponding position in devices array
    var devices = [];
    for (var i=0; i<this.state.selectedRows.length; i++) {
      devices.push(this.state.devices[this.state.selectedRows[i]]);
    }
    return devices;
  },

  _authorizeDevices: function(devices, index) {
    if (Array.isArray(devices)) {
      this.props.authorizeDevices(devices);
    } else if (this.state.selectedRows) {
      this.props.authorizeDevices(this._getDevicesFromSelectedRows());
    }
    if (index !== undefined) {
      this.setState({authLoading: index});
    } else {
      this.setState({authLoading: "selected"});
    }
  },

  _openRejectDialog: function(device, index) {
    AppActions.setSnackbar("");
    var reject = {
      device: device,
      index: index
    };
    this.setState({deviceToReject: reject, openReject: true, rejectLoading: index, selectedRows:[]});
  },
  _closeReject: function() {
    this.setState({deviceToReject: {}, openReject: false});
  },
  _showKey: function() {
    var self = this;
    self.setState({showKey: !self.state.showKey});
  },


  render: function() {
    var limitMaxed = this.props.deviceLimit && (this.props.deviceLimit <= this.props.totalDevices);
    var limitNear = this.props.deviceLimit && (this.props.deviceLimit < this.props.totalDevices + this.state.devices.length );

    var devices = this.state.devices.map(function(device, index) {
      var self = this;

      var expanded = '';
      if ( self.state.expandRow === index ) {
        expanded = <ExpandedDevice _showKey={this._showKey} showKey={this.state.showKey} rejectOrDecomm={this.props.rejectOrDecomm} disabled={limitMaxed} styles={this.props.styles} deviceId={self.state.deviceId} device={self.state.expandedDevice} unauthorized={true} selected={[device]}  />
      }

      return (
        <TableRow selected={this._isSelected(index)} className={expanded ? "expand" : null} hoverable={true} key={index}>
          <TableRowColumn className="no-click-cell" style={expanded ? {height: this.state.divHeight} : null}>
             <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              self._expandRow(index);
            }}>
              {device.device_id}
            </div>
          </TableRowColumn>
          <TableRowColumn className="no-click-cell">
              <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              self._expandRow(index);
            }}>
            <Time value={device.request_time} format="YYYY-MM-DD HH:mm" />
            </div>
          </TableRowColumn>
          <TableRowColumn className="no-click-cell capitalized">
            <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              self._expandRow(index);
            }}>{device.status}
            </div>
          </TableRowColumn>
          <TableRowColumn style={{width:"55px", paddingRight:"0", paddingLeft:"12px"}} className="expandButton">
             <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this._expandRow(index);
            }}>
              <IconButton className="float-right"><FontIcon className="material-icons">{ expanded ? "arrow_drop_up" : "arrow_drop_down"}</FontIcon></IconButton>
            </div>
          </TableRowColumn>
          <TableRowColumn style={{width:"0", padding:"0", overflow:"visible"}}>
            <Collapse springConfig={{stiffness: 210, damping: 20}} onHeightReady={this._adjustCellHeight} className="expanded" isOpened={expanded ? true : false}
              onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
              {expanded}
            </Collapse>
            
          </TableRowColumn>
        </TableRow>
      )
    }, this);
    
    var deviceLimitWarning = (limitMaxed || limitNear) ?
      (
        <p className="warning">
          <InfoIcon style={{marginRight:"2px", height:"16px", verticalAlign:"bottom"}} />
          <span className={limitMaxed ? null : "hidden"}>You have reached</span><span className={limitNear&&!limitMaxed ? null : "hidden"}>You are nearing</span> your limit of authorized devices: {this.props.totalDevices} of {this.props.deviceLimit}
        </p>
    ) : null;

    var minHeight = deviceLimitWarning ? this.state.minHeight + 20 : this.state.minHeight;


    var rejectActions =  [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this._closeReject} />
      </div>,
      <RaisedButton
        label="Reject device"
        secondary={true}
        onClick={this.props.rejectDevice.bind(null, this.state.deviceToReject.device)}
        icon={<FontIcon style={{marginTop:"-4px"}} className="material-icons">cancel</FontIcon>} />
    ];


    return (
      <Collapse springConfig={{stiffness: 190, damping: 20}} style={{minHeight:minHeight, width:"100%"}} isOpened={true} id="rejected" className="absolute authorize padding-top">
        
      <Loader show={this.state.authLoading==="all"} />


        { this.state.devices.length && this.state.authLoading!=="all" ?

          <div className="padding-bottom">

            <h3 className="align-center">Rejected devices</h3>

            {deviceLimitWarning}

            <Table
              multiSelectable={true}
              onRowSelection={this._onRowSelection}>
              <TableHeader
                className="clickable"
                enableSelectAll={true}>
                <TableRow>
                  <TableHeaderColumn className="columnHeader" tooltip="ID">ID</TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Request time">Request time</TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Status">Status</TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" style={{width:"55px", paddingRight:"12px", paddingLeft:"0"}}></TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                showRowHover={true}
                deselectOnClickaway={false}
                className="clickable">
                {devices}
              </TableBody>
            </Table>

            <div className="margin-top">
              <Pagination locale={_en_US} simple pageSize={this.state.pageLength} current={this.state.pageNo || 1} total={this.props.count} onChange={this._handlePageChange} />
               {this.state.pageLoading ?  <div className="smallLoaderContainer"><Loader show={true} /></div> : null}
            </div>
          </div>

          :

          <div className={this.state.authLoading ? "hidden" : "dashboard-placeholder"}>
            <p>There are no rejected devices</p>
          </div>
        }

        <div>

        { this.state.selectedRows.length ? 
          <div className="fixedButtons">
            <div className="float-right">

              <div style={{width:"100px", top:"7px", position:"relative"}} className={this.props.disabled ? "inline-block" : "hidden"}>
                <Loader table={true} waiting={true} show={true} />
              </div>

              <span className="margin-right">{this.state.selectedRows.length} {pluralize("devices", this.state.selectedRows.length)} selected</span>
              <RaisedButton disabled={this.props.disabled || limitMaxed || limitNear} onClick={this._authorizeDevices} primary={true} label={"Authorize " + this.state.selectedRows.length +" " + pluralize("devices", this.state.selectedRows.length)} />
              {deviceLimitWarning}
            </div>
          </div>
        : null }

        </div>

      </Collapse>
    );
  }
});


module.exports = Rejected;