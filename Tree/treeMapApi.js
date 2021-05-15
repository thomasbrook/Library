var utils = {
    HashMap: function () {
        /** Map 大小 **/
        var size = 0;
        /** 对象 **/
        var entry = new Object();

        /** 存 **/
        this.put = function (key, value) {
            if (!this.containsKey(key)) {
                size++;
            }
            entry[key] = value;
        }

        /** 取 **/
        this.get = function (key) {
            return this.containsKey(key) ? entry[key] : null;
        }

        /** 删除 **/
        this.remove = function (key) {
            if (this.containsKey(key) && (delete entry[key])) {
                size--;
            }
        }

        /** 是否包含 Key **/
        this.containsKey = function (key) {
            return (key in entry);
        }

        /** 是否包含 Value **/
        this.containsValue = function (value) {
            for (var prop in entry) {
                if (entry[prop] == value) {
                    return true;
                }
            }
            return false;
        }

        /** 所有 Value **/
        this.values = function () {
            var values = new Array();
            for (var prop in entry) {
                values.push(entry[prop]);
            }
            return values;
        }

        /** 所有 Key **/
        this.keys = function () {
            var keys = new Array();
            for (var prop in entry) {
                keys.push(prop);
            }
            return keys;
        }

        /** Map Size **/
        this.size = function () {
            return size;
        }

        /* 清空 */
        this.clear = function () {
            size = 0;
            entry = new Object();
        }
    }

};

/**
 *
 * treeMapApi
 *
 */
// var result = [];带有父子属性的数组
// var options = $.vonAnalyseData([], "ID", "ParentId", true);
// $("#select").append(options);
; ((function (root, model) {
    if (!root.equip) {
        root.equip = {};
    }

    if (root.equip.treeMapApi) {
        console.log("treeMapApi 已实例化，请检查是否存在命名冲突");
        return;
    };

    root.equip.treeMapApi = model();
})(this, function () {
    'use strict';

    var exports = function () {
        var _this = this;
    };

    var analyseResult;

    //分析数组信息，将json数据转换为哈希数据，解析并组织父子对应关系
    exports.vonAnalyseData = function (d, id, pid, isCodeOption) {
        var data = d;

        //对data数据进行整理解析
        var firstLevelNodes = [];
        var firstLevelParentIds = []; //根节点数组
        var parents = []; //存储存在子节点的所有节点
        var parentToChildMap = new utils.HashMap(); //存储父节点<--子节点列表，key==_parent_id,value==[_node_id,...]
        var childToFatherMap = new utils.HashMap(); //存储父节点<-->子节点，一一对应
        var nodeMap = new utils.HashMap();  //存储节点实例，key==_node_id,value==data[i]

        var len = data.length;
        for (var i = 0; i < len; i++) {
            var _id = data[i][id];
            var _parent = data[i][pid];

            if (exports.indexOfArray(parents, _parent) == -1) parents.push(_parent);
            if (parentToChildMap.containsKey(_parent)) {
                var arr = parentToChildMap.get(_parent);
                arr.push(_id);
                parentToChildMap.put(_parent, arr);

            } else {
                var arr = [];
                arr.push(_id);
                parentToChildMap.put(_parent, arr);

            }
            childToFatherMap.put(_id, _parent);
            nodeMap.put(_id, data[i]);
        }
		
        //查找根节点
        firstLevelParentIds = exports.getInPidsNotInIds(parents, nodeMap.keys());
        //剔除根节点
        parents = exports.getInPidsNotInIds(parents, firstLevelParentIds);
        //根据根节点列表，提取第一级节点
        for (var ii = 0; ii < firstLevelParentIds.length; ii++) {
            firstLevelNodes = firstLevelNodes.concat(parentToChildMap.get(firstLevelParentIds[ii]));
        }

        analyseResult = new utils.HashMap();
        analyseResult.put("firstLevelNodes", firstLevelNodes);
        analyseResult.put("firstLevelParentIds", firstLevelParentIds);
        analyseResult.put("parents", parents);
        analyseResult.put("parentToChildMap", parentToChildMap);
        analyseResult.put("childToFatherMap", childToFatherMap);
        analyseResult.put("nodeMap", nodeMap);

        var options = "";
        for (var i = 0; i < firstLevelNodes.length; i++) {
            var val = firstLevelNodes[i];
            if (isCodeOption) val = nodeMap.get(firstLevelNodes[i]).Code;
            options += "<option value='" + val + "'>" + nodeMap.get(firstLevelNodes[i]).Name + "</option>";
            options += exports.toOptions(analyseResult, firstLevelNodes[i], 1, isCodeOption);
        }
        return options;
    };

    exports.toOptions = function (result, pid, level, isCodeOption) {
        var firstLevelNodes = result.get("parentToChildMap").get(pid);
        var nodeMap = result.get("nodeMap");
        if (!firstLevelNodes) return "";
        var indent = ""
        for (var j = 0; j < level; j++) { indent += "&nbsp;&nbsp;" }
        var options = "";
        var flag = "";
        for (var i = 0; i < firstLevelNodes.length; i++) {
            if (i == (firstLevelNodes.length - 1)) flag = "└";
            else flag = "├";

            var val = firstLevelNodes[i];
            if (isCodeOption) val = nodeMap.get(firstLevelNodes[i]).Code;

            options += "<option value='" + val + "'>" + (indent + flag) + nodeMap.get(firstLevelNodes[i]).Name + "</option>";
            options += exports.toOptions(result, firstLevelNodes[i], ++level, isCodeOption);

            --level;
        }
        return options;
    };

    exports.indexOfArray = function (arr, obj) {
        if (!arr) return -1;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == obj) return i;
        }
        return -1;
        //return $.inArray(obj, arr); // 此方法区分了元素类型
    };

    exports.getInPidsNotInIds = function (pids, ids) {
        var index = [];
		
        var len1 = ids.length;
        for (var ii = 0; ii < len1; ii++) {
            index.push(exports.indexOfArray(pids, ids[ii]));
        }
		
        var virtualNode = [];
        var len2 = pids.length;
        for (var ii = 0; ii < len2; ii++) {
            if (exports.indexOfArray(index, ii) == -1) {
                virtualNode.push(pids[ii]);
            }
        }
        return virtualNode;
    };
    return exports;
}));