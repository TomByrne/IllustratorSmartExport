(function(pack){
	tokens = {};


	tokens.ARTBOARD_NUM_TOKEN = "<ArtboardNum>";
	tokens.ARTBOARD_NAME_TOKEN = "<ArtboardName>";

	tokens.LAYER_NUM_TOKEN = "<LayerNum>",
	tokens.LAYER_NAME_TOKEN = "<LayerName>";

	tokens.FILE_EXT_TOKEN = "<Ext>";

	tokens.ALL = [	"--Tokens--",
					tokens.ARTBOARD_NUM_TOKEN,
					tokens.ARTBOARD_NAME_TOKEN,
					tokens.LAYER_NUM_TOKEN,
					tokens.LAYER_NAME_TOKEN,
					tokens.FILE_EXT_TOKEN
				];

	pack.tokens = tokens;
})(smartExport)