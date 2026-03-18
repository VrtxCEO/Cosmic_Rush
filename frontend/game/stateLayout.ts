import { createLayout } from 'utils-layout';

export const { stateLayout, stateLayoutDerived } = createLayout({
	backgroundRatio: {
		normal: 1, // background is 256x256 (1:1)
		portrait: 1, // same square background for portrait
	},
	mainSizesMap: {
		desktop: { width: 1778, height: 1000 },
		tablet: { width: 1000, height: 1000 },
		landscape: { width: 1778, height: 1000 },
		portrait: { width: 800, height: 1422 },
	},
});
