import { foreach } from "../../func/util";

/**
    getInsertIndex ( index: Number, children: Array )

    Return Type:
    Number
    插入元素的位置索引

    Description:
    获取元素插入的位置索引
    因为插入前的元素中可能有组件元素，组件元素渲染为对应实际dom时可能有多个，所以需判断前面的组件元素，并加上他们的模板元素数量

    URL doc:
    http://icejs.org/######
*/
export function getInsertIndex ( index, children ) {
    let insertIndex = 0;

    for ( let i = 0; i < index; i ++ ) {
        if ( children [ i ].templateNodes ) {
            insertIndex += children [ i ].templateNodes.length;
        }
        else {
            insertIndex ++;
        }
    }

    return insertIndex;
}

/**
    diffAttrs ( newVNode: Object, oldVNode: Object, nodePatcher: Object )

    Return Type:
    void

    Description:
    对比新旧vnode的属性，将差异存入nodePatcher中

    URL doc:
    http://icejs.org/######
*/
export function diffAttrs ( newVNode, oldVNode, nodePatcher ) {
	foreach ( newVNode.attrs, ( attr, name ) => {
        if ( oldVNode.attrs [ name ] !== attr ) {

            // 新旧节点的属性对比出来后的差异需在旧节点上修改，移除时同理
            nodePatcher.reorderAttr ( oldVNode, name, attr );
        }
    } );

    //找出移除的属性
    foreach ( oldVNode.attrs, ( attr, name ) => {
        if ( !newVNode.attrs.hasOwnProperty ( name ) ) {
            nodePatcher.removeAttr ( oldVNode, name );
        }
    } );
}

/**
    diffEvents ( newVNode: Object, oldVNode: Object, nodePatcher: Object )

    Return Type:
    void

    Description:
    对比新旧vnode的事件，将差异存入nodePatcher中
    ！！！场景需要，暂不实现卸载事件的功能

    URL doc:
    http://icejs.org/######
*/
export function diffEvents ( newVNode, oldVNode, nodePatcher ) {

    if ( !oldVNode.events ) {

        // 绑定新vnode上的所有事件
        foreach ( newVNode.events, ( handlers, type ) => {
            nodePatcher.addEvents ( oldVNode, type, handlers );
        } );
    }
    else {
        let addHandlers;
        foreach ( newVNode.events, ( handlers, type ) => {

            addHandlers = [];
            if ( oldVNode.events.hasOwnProperty ( type ) ) {
                foreach ( handlers, handler => {
                    if ( oldVNode.events [ type ].indexOf ( handler ) === -1 ) {
                        addHandlers.push ( handler );
                    }
                } );
            }
            else {
                addHandlers = handlers;
            }

            // 存在没有绑定的时间方法时才绑定
            if ( addHandlers.length > 0 ) {
                nodePatcher.addEvents ( oldVNode, type, addHandlers );
            }
        } );
    }
}

/**
    indexOf ( children: Array, searchNode: Object )

    Return Type:
    Number
    查找的node在children数组中的位置，如果没有找打则返回-1

    Description:
    获取查找的node在children数组中的位置，如果没有找打则返回-1

    URL doc:
    http://icejs.org/######
*/
function indexOf ( children, searchNode ) {
	let index = -1;
    foreach ( children, ( child, i ) => {
        if ( child.key === searchNode.key ) {
            index = i;
            return false;
        }
    } );
	
	return index;
}

/**
    diffChildren ( newChildren: Array, oldChildren: Array, nodePatcher: Object )

    Return Type:
    void

    Description:
    比较新旧节点的子节点，将差异存入nodePatcher中

    URL doc:
    http://icejs.org/######
*/
export function diffChildren ( newChildren, oldChildren, nodePatcher ) {

    if ( oldChildren && oldChildren.length > 0 && ( !newChildren || newChildren.length <= 0 ) ) {
        foreach ( oldChildren, oldChild => {
            nodePatcher.removeNode ( oldChild );
        } );
    }
    else if ( newChildren && newChildren.length > 0 && ( !oldChildren || oldChildren.length <= 0 ) ) {
        foreach ( newChildren, ( newChild, i ) => {
            nodePatcher.addNode ( newChild, i );
        } );
    }
    else if ( newChildren && newChildren.length > 0 && oldChildren && oldChildren.length > 0 ) {

        let keyType = newChildren [ 0 ] && newChildren [ 0 ].key === undefined ? 0 : 1,
            obj = { keyType, children : [] };

        const 
            newNodeClassification = [ obj ],
            oldNodeClassification = [];
        foreach ( newChildren, newChild => {

            // key为undefined的分类
            if ( keyType === 0 ) {
                if ( newChild.key === undefined ) {
                    obj.children.push ( newChild );
                }
                else {
                    keyType = 1;
                    obj = { keyType, children : [ newChild ] };
                    newNodeClassification.push ( obj );
                }
            }
            else if ( keyType === 1 ) {

                // key为undefined的分类
                if ( newChild.key !== undefined ) {
                    obj.children.push ( newChild );
                }
                else {
                    keyType = 0;
                    obj = { keyType, children : [ newChild ] };
                    newNodeClassification.push ( obj );
                }
            }
        } );

        keyType = oldChildren [ 0 ] && oldChildren [ 0 ].key === undefined ? 0 : 1;
        obj = { keyType, children : [] };
        oldNodeClassification.push ( obj );
        foreach ( oldChildren, oldChild => {

            // key为undefined的分类
            if ( keyType === 0 ) {
                if ( oldChild.key === undefined ) {
                    obj.children.push ( oldChild );
                }
                else {
                    keyType = 1;
                    obj = { keyType, children : [ oldChild ] };
                    oldNodeClassification.push ( obj );
                }
            }
            else if ( keyType === 1 ) {

                // key为undefined的分类
                if ( oldChild.key !== undefined ) {
                    obj.children.push ( oldChild );
                }
                else {
                    keyType = 0;
                    obj = { keyType, children : [ oldChild ] };
                    oldNodeClassification.push ( obj );
                }
            }
        } );


        // 对每个分类的新旧节点进行对比
        let moveItems, oldIndex, oldChildrenCopy, oldItem,
            offset = 0;
        foreach ( newNodeClassification,  ( newItem, i ) => {
            oldItem = oldNodeClassification [ i ] || { children : [] };

            if ( newItem.keyType === 0 ) {

                // key为undefined时直接对比同位置的两个节点
                foreach ( newItem.children, ( newChild, j ) => {
                    nodePatcher.concat ( newChild.diff ( oldItem.children [ j ] ) );
                } );

                // 如果旧节点数量比新节点多，则移除旧节点中多出的节点
                if ( newItem.children.length < oldItem.children.length ) {
                    for ( let j = newItem.children.length; j < oldItem.children.length; j ++ ) {
                        nodePatcher.removeNode ( oldItem.children [ j ] );
                    }
                }
            }
            else if ( newItem.keyType === 1 ) {

                // key不为undefined时需对比节点增加、移除及移动
                oldChildrenCopy = oldItem.children;
                foreach ( newItem.children, ( newChild, j ) => {
                    if ( indexOf ( oldChildrenCopy, newChild ) === -1 ) {
                        nodePatcher.addNode ( newChild, getInsertIndex ( j, newItem.children ) + offset );

                        oldChildrenCopy.splice ( j, 0, newChild );
                    }
                } );
                
                let k = 0;
                while ( oldChildrenCopy [ k ] ) {
                    if ( indexOf ( newItem.children, oldChildrenCopy [ k ] ) === -1 ) {
                        nodePatcher.removeNode ( oldChildrenCopy [ k ] );
                        oldChildrenCopy.splice ( k, 1 );
                    }
                    else {
                        k ++;
                    }
                }

                moveItems = [];
                oldIndex = 0;
                foreach ( newItem.children, ( newChild, j ) => {
                    oldIndex = indexOf ( oldChildrenCopy, newChild );
                    if ( oldIndex > -1 ) {
                        nodePatcher.concat ( newChild.diff ( oldChildrenCopy [ oldIndex ] ) );
                        if ( oldIndex !== j ) {
                            moveItems.push ( {
                                item : newChild,
                                from : oldIndex,
                                to : getInsertIndex ( j, newItem.children ),
                                list : oldChildrenCopy.concat ()
                            } );

                            oldChildrenCopy.splice ( oldIndex, 1 );
                            oldChildrenCopy.splice ( j, 0, newChild );
                        }
                    }
                } );
                
                foreach ( optimizeSteps ( moveItems ), move => { 
                    nodePatcher.moveNode ( move.item, move.to + offset );
                } );
            }

            offset += getInsertIndex ( newItem.children.length, newItem.children );
        } );
    }
}

/**
    optimizeSteps ( patches: Array )

    Return Type:
    void

    Description:
    优化步骤
    主要优化为子节点的移动步骤优化

    URL doc:
    http://icejs.org/######
*/
function optimizeSteps ( patches ) {
    let i = 0;
    while ( patches [ i ] ) {
        const 
        	step = patches [ i ],
            optimizeItems = [],
            span = step.from - step.to,
            nextStep = patches [ i + 1 ],

            // 合并的步骤
            mergeItems = { alternates: [], eliminates: [], previous: [] };

        if ( step.to < step.from && ( nextStep && nextStep.to === step.to + 1 && nextStep.from - nextStep.to >= span || !nextStep ) ) {
            for ( let j = step.from - 1; j >= step.to; j -- ) {

                const optimizeItem = { 
                	type : step.type, 
                	item : step.list [ j ], 
                	from : j, 
                	to : j + 1 
                };

                //向前遍历查看是否有可合并的项
                for ( let j = i - 1; j >= 0; j-- ) {
                	let mergeStep = patches [ j ];

                    // 只有一个跨度的项可以分解出来
                    if ( mergeStep.from - mergeStep.to === 1 ) {
                        mergeStep = { 
                        	type : mergeStep.type, 
                        	item : mergeStep.list [ mergeStep.to ], 
                        	from : mergeStep.to, 
                        	to : mergeStep.from 
                        };
                    }

                    if ( mergeStep.item === optimizeItem.item && mergeStep.to === optimizeItem.from ) {
                    	mergeItems.previous.push ( { 
							step : mergeStep, optimizeItem, 
                        	exchangeItems : patches.slice ( j + 1, i ).concat ( optimizeItems ) 
                        } );

                        break;
                    }
                }

                optimizeItems.push ( optimizeItem );
            }
        }
        else {
            i++;
            continue;
        }

        let toOffset = 1,
            j = i + 1,
            lastStep = step,
            mergeStep, mergeSpan;
    	
        while ( patches [ j ] ) {
            mergeStep = patches [ j ],
            mergeSpan = mergeStep.from - mergeStep.to;

            let merge = false;
            if ( step.to + toOffset === mergeStep.to ) {

                if ( mergeSpan === span ) {
                    mergeItems.eliminates.push ( mergeStep );

                    merge = true;
                    lastStep = mergeStep;
                }
                else if ( mergeSpan > span ) {
                    mergeItems.alternates.push ( mergeStep );

                    merge = true;
                    lastStep = mergeStep;
                }

                toOffset ++;
            }

            j ++;

            if ( !merge ) {
                break;
                }
            }

            // 判断是否分解进行合并，依据为合并后至少不会更多步骤
            // 合并项分为相同跨度的项、向前遍历可合并的项
            // +1是因为需算上当前合并项，但在eliminates中并没有算当前合并项
            if ( optimizeItems.length <= mergeItems.eliminates.length + mergeItems.previous.length + 1 ) {
                Array.prototype.splice.apply ( patches, [ patches.indexOf ( lastStep ) + 1, 0 ].concat ( optimizeItems ) );
                patches.splice ( i, 1 );
				
            	let mergeStep;
                foreach ( mergeItems.previous, prevItem => {
                    mergeStep = prevItem.step;

                    // 如果两个合并项之间还有其他项，则需与合并项调换位置
                    // 调换位置时，合并项的from在调换项的from与to之间（包括from与to）则合并项的from-1；调换项的to在合并项的from与to之间（包括from与to）则调换项的to+1
                	let mergeFrom, mergeTo, exchangeFrom, exchangeTo;
                    foreach ( prevItem.exchangeItems, exchangeItem => {
                    	mergeFrom = mergeStep.from;
                        mergeTo = mergeStep.to;
                        exchangeFrom = exchangeItem.from;
                        exchangeTo = exchangeItem.to;

                        if ( mergeFrom >= exchangeFrom && mergeFrom <= exchangeTo ) {
                            mergeStep.from --;
                        }
                        if ( mergeTo >= exchangeFrom && mergeTo <= exchangeTo ) {
                            mergeStep.to --;
                        }

                        if ( exchangeFrom >= mergeFrom && exchangeFrom <= mergeTo ) {
                            exchangeItem.from ++;
                        }
                        if ( exchangeTo >= mergeFrom && exchangeTo <= mergeTo ) {
                            exchangeItem.to ++;
                        }
                    } );

                    prevItem.optimizeItem.from = mergeStep.from;
                    patches.splice ( patches.indexOf ( mergeStep ), 1 );

                    // 向前合并了一个项，则i需-1，不然可能会漏掉可合并项
                    i --;
                } );

                foreach ( mergeItems.eliminates, eliminateItem => {
                    foreach ( optimizeItems, optimizeItem => {
                        optimizeItem.to ++;
                    } );

                    patches.splice ( patches.indexOf ( eliminateItem ), 1 );
                } );

                foreach ( mergeItems.alternates, alternateItem => {
                    foreach ( optimizeItems, optimizeItem => {
                        optimizeItem.to ++;
                    } );

                    alternateItem.to += optimizeItems.length;
                } );
            }
            else {
                i ++;
            }
        }

        return patches;
}