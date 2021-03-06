<Module :title="表格">
	
	<!-- 模块页面模板 -->
	<template>
		<!-- 表格组件渲染 -->
		<EditTable t-th="{{ title }}" t-tr="{{ content }}" />
		<!-- 翻页组件渲染 -->
		<PageCtrl options="{{ pageCtrl }}" setPage="{{ setPage }}" />
	</template>
	

	<!-- 此模板对应的数据 -->
	<script>
    	import EditTable from "../../component/EditTable";
        import PageCtrl from "../../component/PageCtrl";
    	
		new ice.Module ( {
			init () {
				return {
					// 绑定变量与绑定函数直接写返回对象内
					title: ["NO.", "UserName", "Avatar", "Age", "Address"],
					content: [
						["1", "Tom", "img/a1.png", "24", "LongHu street"],
						["2", "Sam", "img/a2.png", "23", "LongHu street"],
						["3", "Ann", "img/a3.png", "25", "LongHu street"],
						["4", "Jane", "img/a4.png", "22", "LongHu street"],
						["5", "Leo", "img/a5.png", "26", "LongHu street"]
					],
					pageCtrl: {
						reqPath 	: "data/user_info",
						currentPage : 1,
						pageCount 	: 10,
						current 	: "current"
					},
	            
	            	setPage ( newVal ) {
	                	this.pageCtrl.currentPage = newVal;
	                }
				};
			}
		} );
	</script>
	

	<!-- 此模板对应的样式 -->
	<style scoped>
		
	</style>
</Module>