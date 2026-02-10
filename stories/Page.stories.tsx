import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Page } from './Page';
import * as HeaderStories from './Header.stories';

const meta: Meta<typeof Page> = {
  title: 'Example/Page',
  component: Page,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    // More on composing args: https://storybook.js.org/docs/react/writing-stories/args#args-composition
    ...HeaderStories.LoggedIn.args,
  },
};

export const LoggedOut: Story = {
  args: {
    ...HeaderStories.LoggedOut.args,
  },
};
