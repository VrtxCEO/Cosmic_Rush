import { mergeMessagesMaps } from 'utils-shared/i18n';
import { messagesMap as messagesMapUiPixi } from 'components-ui-pixi';
import { messagesMap as messagesMapUiHtml } from 'components-ui-html';

import en from './en';
import zh from './zh';
import de from './de';
import fr from './fr';
import es from './es';
import pt from './pt';
import ar from './ar';
import ja from './ja';
import ko from './ko';
import ru from './ru';
import tr from './tr';
import vi from './vi';
import id from './id';
import pl from './pl';
import fi from './fi';
import hi from './hi';

const messagesMapGame = {
	en,
	zh,
	de,
	fr,
	es,
	pt,
	ar,
	ja,
	ko,
	ru,
	tr,
	vi,
	id,
	pl,
	fi,
	hi,
};

const messagesMap = mergeMessagesMaps([messagesMapGame, messagesMapUiPixi, messagesMapUiHtml]);

export default messagesMap;
