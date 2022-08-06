import { ComponentStory, ComponentMeta } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";
import AppBar from "./AppBar";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "UiParts/AppBar",
  component: AppBar,
} as ComponentMeta<typeof AppBar>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof AppBar> = () => (
  <BrowserRouter>
    <AppBar />
  </BrowserRouter>
);

export const Primary = Template.bind({});
