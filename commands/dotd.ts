import {
  APIApplicationCommandInteractionDataRoleOption,
  APIChatInputApplicationCommandGuildInteraction,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { env, prisma } from "../api";
import type { VercelResponse } from "@vercel/node";

const dotdCommand = async (message: any, response: VercelResponse) => {
  const body = message as APIChatInputApplicationCommandGuildInteraction;
  const role = body.data.options?.find(
    (option) => option.name === "mention"
  ) as APIApplicationCommandInteractionDataRoleOption | undefined;
  const databaseEntry = await prisma.dotdWebhook.create({
    data: {
      guildId: body.guild_id,
      mentionRoleId: role?.value,
    },
  });
  const url = `https://discord.com/api/oauth2/authorize?client_id=${env.APPLICATION_ID}&redirect_uri=https%3A%2F%2F${env.SELF_URL}%2Fapi%2Fdotd-webhook-callback&response_type=code&scope=webhook.incoming&guild_id=${body.guild_id}&disable_guild_select=true&state=${databaseEntry.linkingKey}`;
  response.status(200).send({
    type: 4,
    data: {
      flags: 64,
      content: "Click the button below to finish setting up the webhook.",
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              label: "Finish Setup",
              style: ButtonStyle.Link,
              url: url,
            },
          ],
        },
      ],
    },
  });
};

export default dotdCommand;
