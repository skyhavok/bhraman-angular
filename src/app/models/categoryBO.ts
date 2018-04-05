
// categody class
export class CATEGORY {
	_id: string;
	userID: string;
	name: string;
	color: string;
	date: string;
	count: number;
	createdAt: any;
	updatedAt: any;

	constructor(){
		this._id = "";
		this.userID = "";
		this.name = "";
		this.date = "";
		this.count = 0;
		this.color = "";
	}
}
