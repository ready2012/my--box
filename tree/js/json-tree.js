var  jsonTree = function (data, config) {
	var id = config.id || 'id',
		pid = config.pid || 'pid',
		children = config.children || 'children';

	var idMap = [],
		jsonTree = [];

	for(var i=0;i<data.length;i++){
		idMap[data[i][id]] = data[i];	
	}
	for(var i=0;i<data.length;i++){
		var parent = idMap[data[i][pid]];
		if(parent) {
			!parent[children] && (parent[children] = []);
			parent[children].push(data[i]);
		} else {
			jsonTree.push(data[i]);
		}
	}

	

	return jsonTree;
};