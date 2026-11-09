"""Serve the bundled pupil site locally; no external Python packages required."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import threading
import webbrowser


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8047)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1] / 'dist'
    handler = partial(SimpleHTTPRequestHandler, directory=str(root))
    with ThreadingHTTPServer(('127.0.0.1', args.port), handler) as server:
        address = f'http://127.0.0.1:{args.port}'
        print(f'Algebralabbet: {address}\nBehåll terminalen öppen. Stoppa med Ctrl+C.', flush=True)
        if not args.no_browser:
            threading.Timer(0.4, lambda: webbrowser.open(address)).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print('\nAlgebralabbet är stoppat.')


if __name__ == '__main__':
    main()
