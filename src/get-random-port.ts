import net from "node:net";

export async function getRandomPort(): Promise<number> {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const address = srv.address();
      if (!address) {
        resolve(-1);
        return;
      }

      const { port } = address as net.AddressInfo;
      srv.close(() => resolve(port));
    });
  });
}
