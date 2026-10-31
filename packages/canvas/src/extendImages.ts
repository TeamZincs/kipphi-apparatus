import { Images } from "kipphi-player";

declare module "kipphi-player" {
    namespace Images {
        export const SELECT_NOTE: ImageBitmap;
        export const START_NODE: ImageBitmap;
        export const END_NODE: ImageBitmap;
        export function initImagesForEditor({
            selectNote,
            startNode,
            endNode,
        }: {
            selectNote: string;
            startNode: string;
            endNode: string;
        }): Promise<void>;
    }
}

Images.initImagesForEditor = async ({
    selectNote,
    startNode,
    endNode,
}: {
    selectNote: string;
    startNode: string;
    endNode: string;
}) => {
    // @ts-expect-error 这就是常量，但是初始化的时候当然可以赋值
    Images.SELECT_NOTE = await createImageBitmap(
        await Images.loadImage(selectNote),
    );
    // @ts-expect-error 这就是常量，但是初始化的时候当然可以赋值
    Images.START_NODE = await createImageBitmap(
        await Images.loadImage(startNode),
    );
    // @ts-expect-error 这就是常量，但是初始化的时候当然可以赋值
    Images.END_NODE = await createImageBitmap(await Images.loadImage(endNode));
};
