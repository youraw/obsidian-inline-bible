import { ParseResultType } from "./ParseResultType";

function escapeRegex(val: string) {
	return val.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function parseText(text: string, prefix: string) {
	const replaceRegex = new RegExp(`${escapeRegex(prefix)}((?:\\d\\.? ?)?[a-zA-ZäöüÄÖÜ]+ \\d+(?:,(?:\\d+(?:-(?:\\d+(?:,(?:\\d+)?)?)?)?)?)?)(!?)([.^]?)`, 'g');
	const matches = text.matchAll(replaceRegex);
	const result: ParseResultType[] = [];

	for (let {0: match, 1: bibleReference, 2: excludeCommentsModifierMatch, 3: otherModifier, index} of matches) {
		const excludeCommentsModifier = excludeCommentsModifierMatch === '!';

		const [chapter, verses] = bibleReference.split(',');
		const bookParts = chapter.split(' ');
		bookParts.pop();
		const book = bookParts.join(' ');

		let verseParts = [0, Infinity];
		if (verses) {
			const stringVerseParts = verses.split('-');
			verseParts = stringVerseParts.map(Number);
			if (verseParts.length === 1) {
				verseParts.push(verseParts[0]);
			} else if (stringVerseParts[1].trim() === ""){
				verseParts[1] = verseParts[0];
			}
		}

		result.push({
			book,
			chapter,
			verses: {
				start: verseParts[0],
				end: verseParts[1]
			},
			startIndex: index ?? 0,
			endIndex: (index ?? 0) + match.length,
			// is also the key for the decoration cache
			bibleReference: bibleReference+excludeCommentsModifierMatch+otherModifier,
			excludeCommentsModifier,
			linkOnly: otherModifier === '.',
			collapsed: otherModifier === '^'
		});
	}

	return result;
}
