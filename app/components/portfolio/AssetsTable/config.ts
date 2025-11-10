import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

const UButton = resolveComponent("UButton");
export const columns: TableColumn<TokenDto>[] = [
  {
    id: "expand",
    cell: ({ row }) =>
      h(UButton, {
        color: "neutral",
        // variant: "ghost",
        // icon: "i-lucide-chevron-down",
        // square: true,
        // "aria-label": "Expand",
        // ui: {
        //   leadingIcon: [
        //     "transition-transform",
        //     row.getIsExpanded() ? "duration-200 rotate-180" : "",
        //   ],
        // },
        label: "test",
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: "tokenMetadata",
    header: "Token",
    cell: ({ row }) => {
      console.log("row", row);
      return (
        (row.getValue("tokenMetadata") as TokenMetadataDto).symbol || "ETH"
      );
    },
  },
  {
    accessorKey: "tokenBalance",
    header: "Amount",
    cell: ({ row }) => {
      return row.getValue("tokenBalance") as string;
    },
  },
  {
    accessorKey: "tokenPrice",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("tokenPrice") as number;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return formatted;
    },
  },
  {
    accessorKey: "tokenValue",
    header: "Value",
    cell: ({ row }) => {
      const amount = row.getValue("tokenValue") as number;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return formatted;
    },
  },
];
