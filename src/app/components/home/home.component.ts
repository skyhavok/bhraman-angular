import { Component, OnInit, ViewChild } from '@angular/core';
import { } from '@types/googlemaps';
import { CategoryService } from '../../services/category.service';
import { ContactService } from '../../services/contact.service';
import { CONTACT } from '../../models/contactBO';
import { CATEGORY } from '../../models/categoryBO';
import { ActivatedRoute } from '@angular/router';
//import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { SelectControlValueAccessor } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { USER } from '../../models/userBO';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	@ViewChild('gmap') gmapElement: any;
	
	map: google.maps.Map;
	isTracking = false;

	currentLat: any;
	currentLong: any;
	marker: any;
	markers: any = [];
	circles: any = [];
	
	// CONTACTs and Category
	tmpObj: CONTACT;
	contactList: CONTACT[];
	searchContactList: CONTACT[] = [];
	categoryList: CATEGORY[];
	
	ttmp: any;
	// category selection
	optionSelected = [];
	selectedIdx = [];
	listContent:string = "";
	prev_infowindow = null;
	
	//notes
	myNoteDate: string = "" ;
	myNoteText: string = "";
	user: USER;

	constructor(
		private route: ActivatedRoute, 
		private CategoryService: CategoryService,
		private ContactService: ContactService,
		private authService: AuthService) {
			this.route.params.subscribe( params => console.log(params) );
		}

	ngOnInit() { 
		this.tmpObj = new CONTACT();
		this.optionSelected = [];
		this.selectedIdx = [];
		
		var mapProp = {
			center: new google.maps.LatLng(17.385044, 78.4877),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			
		};
		
		this.marker = navigator.geolocation.getCurrentPosition((position) => {});	
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
		// service call

		this.user = new USER();
		this.authService.getProfile().subscribe(profile => {
			this.user = profile.user;
			this.getContact();
			this.getCategory();
		},
		err => {
			console.log(err);
			return false;
		});
		
		
		
		
		//this.findMe();
		
	}
	
	ngOnInit2(){		
		//this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
		
        for (var i = 0; i < this.markers.length; i++) {
          this.markers[i].setMap(null);
        }
		for (var i = 0; i < this.circles.length; i++) {
          this.circles[i].setMap(null);
        }
		
		navigator.geolocation.getCurrentPosition((position) => {
			let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			this.map.panTo(location);
			var circle = new google.maps.Circle({
				center: location,
				map: this.map,
				radius: 1000,          // IN METERS.
				fillColor: '#00628B',
				fillOpacity: 0.2,
				strokeColor: "#FFF",
				strokeWeight: 0         // DON'T SHOW CIRCLE BORDER.
			});
			this.circles.push(circle);
			this.findNearByContacts();
		})
		
	}
	
	clearall(){
		this.selectedIdx=[];
		this.optionSelected = [];
		this.onChange();
		this.ngOnInit2();
	}

    selectItem(index):void {	
		// console.log(this.selectedIdx)
		var idx = this.selectedIdx.indexOf(index);
		if(idx > -1){
			this.selectedIdx.splice(idx, 1);
			
		} else {
			this.selectedIdx.push(index);
		}
    }
	chooseCat(catID){
		var idx = this.optionSelected.indexOf(catID);
		if(idx > -1){
			this.optionSelected.splice(idx, 1);
			
		} else {
			this.optionSelected.push(catID);
		}
		this.onChange();
	}
	
	onChange() {
		// filter contacts and search
		this.searchContactList = this.contactList.filter(contact => {
			var s=0;
			for(s=0;s<this.optionSelected.length;s++){
				if(contact.categoryID === this.optionSelected[s]) {
					console.log(s);
					return true;
				}
			}
		});
		console.log(this.searchContactList)
		if(this.searchContactList.length>=0){
			console.log("ngOnInit2")
			this.ngOnInit2();
		} 
    }
	
	
	
	getCategory(){
		console.log('Categories Fetched from Component');
		//this.categoryList = CATEGORIES; 
		
		this.CategoryService.fetchCategoryAll(this.user._id)
			.subscribe(
				data => {
					this.categoryList = data
					var s = 0;
					for(s=0; s< this.categoryList.length;s++){
						this.selectedIdx.push(s);
						this.optionSelected.push(this.categoryList[s]._id);
					}
					//console.log(this.optionSelected)
					this.trackMe();
				},
				error => {},
				()=> console.log("done")
			); 
		
	}

	
	getContact(){
		console.log("Get all contacts");
		//this.contactList = CONTACTS;
		//this.searchContactList = CONTACTS;
		
		this.ContactService.fetchContactAll(this.user._id)
			.subscribe(
				data => {
					this.contactList = data;
					this.searchContactList = data;
					//console.log(data)
				},
				error => { },
				()=> console.log("done")
			);
    }
	

	
	

/* 	findMe() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				this.showPosition(position);
			});
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}

	showPosition(position) {
		this.currentLat = position.coords.latitude;
		this.currentLong = position.coords.longitude;

		let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		var circle = new google.maps.Circle({
			center: location,
			map: this.map,
			radius: 1000,          // IN METERS.
			fillColor: '#FF6600',
			fillOpacity: 0.3,
			strokeColor: "#FFF",
			strokeWeight: 0         // DON'T SHOW CIRCLE BORDER.
		});
		this.map.panTo(location);

		circle.setMap(this.map);

		if (this.marker) {
			this.marker = new google.maps.Marker({
				position: location,
				map: this.map,
				title: 'My Position',
				icon: 'https://dcassetcdn.com/design_img/612534/82744/82744_3973059_612534_image.jpg'
				});
		}
		else {
			
			this.marker.setPosition(location);
		}
	}
	 */
	
	

	
	/////////////////////////
	trackMe() {
		//console.log("trackMe");
		if (navigator.geolocation) {
			this.isTracking = true;
			navigator.geolocation.getCurrentPosition((position) => {
				this.showTrackingPosition(position);
			}, (err) => {
				console.log(err);
			});
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}

	showTrackingPosition(position) {
		//console.log("showTrackingPosition");

		this.currentLat = position.coords.latitude;
		this.currentLong = position.coords.longitude;

		let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		
		this.map.panTo(location);
		
		var circle = new google.maps.Circle({
				center: location,
				map: this.map,
				radius: 1000,          // IN METERS.
				fillColor: '#00628B',
				fillOpacity: 0.2,
				strokeColor: "#FFF",
				strokeWeight: 0         // DON'T SHOW CIRCLE BORDER.
			});
			
		this.circles.push(circle);
		//circle.setMap(this.map);
			
		/* var icon = {
			url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // url
			scaledSize: new google.maps.Size(50, 50), // scaled size
			origin: new google.maps.Point(0, 0), // origin
			anchor: new google.maps.Point(50, 50) // anchor
		} */
		/* var icon: {
                  path: pinSymbol
                  scale: 5,
                  strokeWeight:2,
                  strokeColor:"#B40404"
               }, */
		
		if (!this.marker) {
			this.marker = new google.maps.Marker({
				position: location,
				map: this.map,
				title: 'You are Here!',
				
				icon: this.pinSymbol('blue')
			});
		}
		else {
			this.marker.setPosition(location);
		}
		this.findNearByContacts();
	}
	pinSymbol(color) {
		return {
			path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
			fillColor: color,
			fillOpacity: 1,
			strokeColor: '#000',
			strokeWeight: 2,
			scale: 1
		};
	}

	findNearByContacts() {
		//console.log("findNearByContacts");
		//console.log(this.searchContactList)
		this.searchContactList.forEach(contact => {
			var dist = this.findDistance(this.currentLat, 
										this.currentLong, 
										contact.position.lat, 
										contact.position.lng);
			//console.log(dist)
			if (dist < 1) {
				console.log(contact.notes)
				this.showContactInMap(contact);
				
			}
		});
	}

	showContactInMap(contact: CONTACT) {
		//console.log("showContactInMap");
		var marker = new google.maps.Marker({
							position: new google.maps.LatLng(contact.position.lat, 
															contact.position.lng),
							map: this.map,
							title: contact.name
			});
		this.ttmp = contact;
		var infoWindowContent = this.InfoWinContent(contact)
		marker.addListener('click',(tmp)=>{
			if( this.prev_infowindow ) {
			   this.prev_infowindow.close();
			}
			
			var infowindow = new google.maps.InfoWindow({ content: infoWindowContent });
			this.prev_infowindow = infowindow;
			infowindow.open(this.map, marker);
	    });
		this.markers.push(marker );
	}

	findDistance(lat1, lon1, lat2, lon2, unit="K") {
		var radlat1 = Math.PI * lat1/180
		var radlat2 = Math.PI * lat2/180
		var theta = lon1-lon2
		var radtheta = Math.PI * theta/180
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist)
		dist = dist * 180/Math.PI
		dist = dist * 60 * 1.1515
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist
	}
	
	InfoWinContent(obj: CONTACT){
		
		for(var t=0;t<obj.notes.length;t++){
			this.listContent  = this.listContent + "<li style='word-wrap: break-word; padding-top: 7px'>" + "<b>"+obj.notes[t].date+":</b> " + obj.notes[t].note  +"</li>"
		}
		var infoWindowContent = "<div style='width: 300px' >"+
									"<h2 class='firstHeading'><b>Name:</b> " + obj.name + "</h2>"+
									"<hr>"+
									"<h2> Notes: </h2>"+
									"<ol style='padding-left:20px'>"+
										this.listContent+
									"</ol>"+
								"</div>"


								// "<a href='#addNotes' data-toggle='modal' class='delete btn btn-danger btn-xs'"+
								// 	"passId("+obj._id+")> Add </a>"
		
		return infoWindowContent;
	}
	addNote(id){
		if(this.myNoteDate.length>0 && this.myNoteText.length>0){
			
			this.ContactService.fetchContactById(id)
			.subscribe(
				data => {
					this.tmpObj = data[0];
					this.tmpObj.notes.push({
						date: this.myNoteDate,
						note: this.myNoteText
					});
					this.updateContact(this.tmpObj);
					
				},
				error => alert(error),
				()=> console.log("done")
			);
		}
	}
	updateContact(obj:CONTACT){
		console.log("Contact Updated from Component");
		
		this.ContactService.updateContactById(obj._id, obj)
			.subscribe(
				data => {
					console.log("updated contact");
					console.log(data)
				},
				error => alert(error),
				()=> console.log("done")
			); 
    }
}

