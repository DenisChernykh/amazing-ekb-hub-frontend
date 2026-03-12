import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';

export default function HomePage() {
  return (
    <Box px="6" py="10">
      <Stack gap="4" maxW="xl">
        <Text fontSize="sm" color="gray.fg">
          Стрельчук в Екатеринбурге
        </Text>
        <Heading size="2xl">Добро пожаловать в мой гид по Екатеринбургу</Heading>
        <Text color="gray.solid">Автор: Стрельчук Татьяна</Text>

        <Button width="fit-content" colorPalette="teal">
          Начать путешествие
        </Button>
      </Stack>
    </Box>
  );
}
