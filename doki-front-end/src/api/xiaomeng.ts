export default async function fetchStream(prompt: string, callback: (content: string) => void) {
  const xiaomeng = 'http://localhost:10011/search/chat';

  const response = await fetch(`${xiaomeng}?prompt=${encodeURIComponent(prompt)}`, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
    },
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // 尝试按行切割
    let lines = buffer.split('\n');
    buffer = lines.pop()!;   // 最后一个可能是不完整的行，留着下次继续拼

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;

      const dataStr = line.replace(/^data:\s*/, '');
      if (dataStr === '[DONE]') continue;

      try {
        const json = JSON.parse(dataStr);
        const content = json.choices?.[0]?.delta?.content;
        if (content) callback(content);
      } catch (err) {
        // JSON 不完整不会进来，我们只解析完整的行
      }
    }
  }

  console.log('流读取完毕');
}
