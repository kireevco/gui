import React from 'react';
import Time from 'react-time';
import Router from 'react-router';

// material ui
import mui from 'material-ui';

var List = mui.List;
var ListItem = mui.ListItem;
var Divider = mui.Divider;
var FontIcon = mui.FontIcon;
var FlatButton = mui.FlatButton;
var IconButton = mui.IconButton;
var TextField = mui.TextField;

var ReactTags = require('react-tag-input').WithContext;
var tagslist = [];


var SelectedImage = React.createClass({
  getInitialState: function() {
    return {
      tagEdit: false,
      descEdit: false
    };
  },
  _handleLinkClick: function(model) {
    var filters = "model="+model;
    filters = encodeURIComponent(filters);
    this.props.history.push("/devices/:groupId/:filters", {groupId:1, filters: filters}, null);
  },
  _clickImageSchedule: function() {
    this.props.openSchedule("schedule", this.props.image);
  },
  handleDelete: function(i) {
    tagslist.splice(i, 1);
  },
  handleAddition: function(tag) {
    tagslist.push({
        id: tagslist.length + 1,
        text: tag
    });
  },
  handleDrag: function(tag, currPos, newPos) {

  },
  _tagsEdit: function(image) {
    if (this.state.tagEdit) {
      var noIds = [];
      for (var i in tagslist) {
        noIds.push(tagslist[i].text);
      }

      // save new tag data to image
      image.tags = noIds;
      //this.props.uploadImage(image);
      
      // hacky
      var newimage = this.props.image;
      newimage.tags = image.tags;

      // update image upstream
      this.props.editImage(image);
    }
    this.setState({tagEdit: !this.state.tagEdit});
  },
  _initTagslist: function(list) {
     for (var i in list) {
      if (list[i] !== '-') {
        tagslist.push({id: i, text:list[i]});
      }
    }
  },
  _descEdit: function(image) {
    if (this.state.descEdit) {
      image.description = this.state.descValue;
      // save change
      this.props.editImage(image);
    }
    this.setState({descEdit: !this.state.descEdit});
  },
  handleDescChange: function(event) {
    this.setState({
      descValue: event.target.value
    });
  },
  render: function() {
    var info = {name: "-", tags: ['-'], model: "-", build_date: "-", modified: "-", size: "-", checksum: "-", devices: "-", description: "-"};
    if (this.props.image) {
      for (var key in this.props.image) {
        if (this.props.image[key] != null) { info[key] = this.props.image[key] };
        if (key.indexOf("modified")!==-1) {
          info[key] = (
            <Time style={{position:"relative", top:"4"}} value={this.props.image[key]} format="YYYY/MM/DD HH:mm" />
          )
        }
      }
    }
    tagslist = [];
    this._initTagslist(info.tags);

    var styles = {
      editButton: {
        color: "rgba(0, 0, 0, 0.54)",
        fontSize: "20" 
      }
    }
    var editButton = (
      <IconButton iconStyle={styles.editButton} style={{top:"auto", bottom: "0"}} onClick={this._tagsEdit.bind(null, this.props.image)} iconClassName="material-icons">
        {this.state.tagEdit ? "check" : "edit"}
      </IconButton>
    );
    var editButtonDesc = (
      <IconButton iconStyle={styles.editButton} style={{position:"absolute", right:"0", bottom: "8"}} onClick={this._descEdit.bind(null, this.props.image)} iconClassName="material-icons">
        {this.state.descEdit ? "check" : "edit"}
      </IconButton>
    );

    var tagInput = (
      <ReactTags tags={tagslist} 
        handleDelete={this.handleDelete}  
        handleAddition={this.handleAddition}
        handleDrag={this.handleDrag}
        delimeters={[9, 13, 188]} />
    );

    var descInput = (
      <TextField ref="description" defaultValue={info.description} onChange={this.handleDescChange} />
    );

    var tags = this.state.tagEdit ? tagInput : info.tags.join(', ');
    var desc = this.state.descEdit ? descInput : info.description;

    return (
      <div id="imageInfo" className={this.props.image.name == null ? "muted" : null}>
        <h3>Image details</h3>
        <div className="report-list">
          <List>
            <ListItem disabled={true} primaryText="Software" secondaryText={info.name} />
            <Divider />
            <ListItem disabled={this.props.image.model ? false : true} primaryText="Device type" secondaryText={info.model} onClick={this._handleLinkClick.bind(null, info.model)} />
            <Divider />
            <ListItem disabled={true} primaryText="Size" secondaryText={info.size} />
            <Divider />
          </List>
        </div>
        <div className="report-list">
          <List>
            <ListItem disabled={true} primaryText="Date built" secondaryText={info.build_date} />
            <Divider />
            <ListItem disabled={true} primaryText="Date uploaded" secondaryText={info.modified} />
            <Divider />
            <ListItem disabled={true} primaryText="Installed on devices" secondaryText={info.devices ? info.devices : "-"} />
            <Divider />
          </List>
        </div>
        <div className="report-list" style={{width: "320"}}>
          <List>
            <ListItem rightIconButton={editButton} disabled={true} primaryText="Tags" secondaryText={tags} />
            <Divider />
            <ListItem disabled={true} primaryText="Checksum" secondaryTextLines={2} style={{wordWrap:"break-word"}} secondaryText={info.checksum} />
            <Divider />
          </List>
        </div>
        <div className="float-right">
          
        </div>
        <div className="margin-top">
          <div className="report-list" style={{padding:"8px 0px", width:"590", verticalAlign:"top", position:"relative"}}>
            <div style={{padding:"20px 16px 15px", fontSize:"16", lineHeight:"16px"}}>
              <span style={{color:"rgba(0,0,0,0.8)"}}>Description</span>
              <div style={{color:"rgba(0,0,0,0.54)", marginRight:"30", marginTop:"4"}}>{desc}</div>
              {editButtonDesc}
            </div>
            <hr style={{margin:"0", backgroundColor:"#e0e0e0", height:"1", border:"none"}} />
          </div>
          <div className="report-list" style={{width:"320"}}>
            <List>
              <ListItem
                disabled={this.props.image.name ? false : true}
                primaryText="Deploy update"
                secondaryText="Update devices with this image"
                onClick={this._clickImageSchedule}
                leftIcon={<FontIcon className="material-icons">schedule</FontIcon>} />
              <Divider />
            </List>
          </div>
        </div>
      </div>
    );
  }
});

SelectedImage.contextTypes = {
  location: React.PropTypes.object,
  history: React.PropTypes.object
};

module.exports = SelectedImage;


        