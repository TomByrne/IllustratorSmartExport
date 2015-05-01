(function(pack){
	tokens = {};

	var heading = "--Tokens--";

	tokens.ARTBOARD_NUM_TOKEN = "<ArtboardNum>";
	tokens.ARTBOARD_NAME_TOKEN = "<ArtboardName>";

	tokens.LAYER_NUM_TOKEN = "<LayerNum>",
	tokens.LAYER_NAME_TOKEN = "<LayerName>";

	tokens.SYMBOL_NAME_TOKEN = "<SymbolName>";

	tokens.FILE_EXT_TOKEN = "<Ext>";

	tokens.DOC_NAME_TOKEN = "<DocName>";

	tokens.ARTBOARD_TOKENS = [	heading,
								tokens.ARTBOARD_NUM_TOKEN,
								tokens.ARTBOARD_NAME_TOKEN,
								tokens.FILE_EXT_TOKEN,
								tokens.DOC_NAME_TOKEN
							];

	tokens.LAYER_TOKENS = [		heading,
								tokens.ARTBOARD_NUM_TOKEN,
								tokens.ARTBOARD_NAME_TOKEN,
								tokens.LAYER_NUM_TOKEN,
								tokens.LAYER_NAME_TOKEN,
								tokens.FILE_EXT_TOKEN,
								tokens.DOC_NAME_TOKEN
							];

	tokens.SYMBOL_TOKENS = [	heading,
								tokens.SYMBOL_NAME_TOKEN,
								tokens.FILE_EXT_TOKEN,
								tokens.DOC_NAME_TOKEN
							];

	pack.tokens = tokens;
})(smartExport)