import { type, foreach } from "../func/util";

export default {

	modules : {},

	/**
		push ( name: String, module: DOMString|DOMObject )
	
		Return Type:
		void
	
		Description:
		添加页面模块缓存
	
		URL doc:
		http://icejs.org/######
	*/
	push : function ( name, module ) {
		this.modules [ name ] = module;
	},

	/**
		get ( name: String )
	
		Return Type:
		DOMString|DOMObject
		缓存模块
	
		Description:
		获取页面模块缓存，没有找到则返回null
	
		URL doc:
		http://icejs.org/######
	*/
	get : function ( name ) {
		return this.modules [ name ] || null;
	}
};