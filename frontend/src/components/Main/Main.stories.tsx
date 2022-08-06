import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Main } from "./Main";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Main/Main",
  component: Main,
} as ComponentMeta<typeof Main>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Main> = () => <Main />;

export const Primary = Template.bind({});
