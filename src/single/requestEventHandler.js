import iceAttr from "./iceAttr";
import { serialize } from "../func/node";
import { type } from "../func/util";
import Router from "../router/core";
import http from "../http/core";
import iceHistory from "./history/iceHistory";
import { moduleErr } from "../error";
import Structure from "../core/tmpl/Structure";

/**
    requestEventHandler ( pathResolver: Object, method: String, post: Object )

    Return Type:
    void

    Description:
    为最外层模块对象绑定请求动作的事件代理
    参数post为post请求时的数据

    url doc:
    http://icejs.org/######
*/
export default function requestEventHandler ( pathResolver, method, post ) {

    if ( method === "GET" ) {

        const 
            param = {},
        	nextStructure = Router.matchRoutes ( pathResolver.pathname, param ),
            nextStructureBackup = nextStructure.copy ();

    	if ( !nextStructure.isEmptyStructure () ) {
            const location = {
                path : pathResolver.pathname + pathResolver.search,
                nextStructure,
                param,
                get : pathResolver.search,
                post : post.nodeType ? serialize ( post ) : post,
                method,
                action : "PUSH"
            };
            
            // 根据更新后的页面结构体渲染新视图            
            Structure.currentPage
            .update ( nextStructure )
            .render ( location, nextStructureBackup );
                	
        }
        else {

            // 匹配路由后为空时返回false，外层将不阻止此链接
            return false;
        }
    }
    else if ( method === "POST" ) {

        // post提交数据
        http.post ( pathResolver.pathname + pathResolver.search, post, ( redirectPath ) => {
            if ( redirectPath ) {
                requestEventHandler ( iceHistory.history.buildURL ( redirectPath ), "GET", post );
            }
        } );
    }
}