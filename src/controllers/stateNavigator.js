var opts = {
  manipulation: false,
  height: '90%',
  layout: {
    hierarchical: {
      enabled: true,
      levelSeparation: 300
    }
  },
  physics: {
    hierarchicalRepulsion: {
      nodeDistance: 300
    }
  }
};

nodes = [
 {'id': '000', 'size': 150, 'label': "000 A\ndescription: Card read state\n\nscreen_number:970\ngood_read_next_state:500\nerror_screen_number:128\nread_condition_1:002\nread_condition_2:002\nread_condition_3:002\ncard_return_flag:001\nno_fit_match_next_state:127", 'color': "white", 'shape': 'box', 'font': {'size': '28', 'face': 'monospace', 'align': 'width'}},
 {'id': 'cfg_0x00405a49', 'size': 150, 'label': "0x00405a49:\ntest   bl, 0x01\nje     0x00405a62<<Insn>>\n", 'color': "white", 'shape': 'box', 'font': {'size': '28', 'face': 'monospace', 'align': 'left'}},
 {'id': 'cfg_0x00405a55', 'size': 150, 'label': "0x00405a55:\nmov    ecx, DWORD PTR ss:[esp + 0x1c]\npush   ecx\ncall   0x004095c6<<Func>>\n", 'color': "white", 'shape': 'box', 'font': {'size': '28', 'face': 'monospace', 'align': 'left'}},
 {'id': 'cfg_0x00405a62', 'size': 150, 'label': "0x00405a62:\nmov    eax, 0x00000002\nmov    ecx, DWORD PTR ss:[esp + 0x000000a8]\nmov    DWORD PTR fs:[0x00000000], ecx\npop    ecx\npop    esi\npop    ebp\npop    ebx\nadd    esp, 0x000000a4\nret\n", 'color': "white", 'shape': 'box', 'font': {'size': '28', 'face': 'monospace', 'align': 'left'}},
 {'id': 'cfg_0x004095c6', 'size': 150, 'label': "0x004095c6:\nmov    edi, edi\npush   ebp\nmov    ebp, esp\npop    ebp\njmp    0x00417563<<Func>>\n", 'color': "white", 'shape': 'box', 'font': {'size': '28', 'face': 'monospace', 'align': 'left'}},
 {'id': 'cfg_0x00405a39', 'size': 150, 'label': "0x00405a39:\nand    ebx, 0xfd<-0x03>\nlea    ecx, [esp + 0x34]\nmov    DWORD PTR ss:[esp + 0x10], ebx\ncall   0x00403450<<Func>>\n", 'color': "white", 'shape': 'box', 'font': {'size': '28', 'face': 'monospace', 'align': 'left'}},
 {'id': 'cfg_0x00403450', 'size': 150, 'label': "0x00403450:\npush   0xff<-0x01>\npush   0x0042fa64\nmov    eax, DWORD PTR fs:[0x00000000]\npush   eax\npush   ecx\npush   ebx\npush   ebp\npush   esi\npush   edi\nmov    eax, DWORD PTR ds:[0x0043dff0<.data+0x0ff0>]\nxor    eax, esp\npush   eax\nlea    eax, [esp + 0x18]\nmov    DWORD PTR fs:[0x00000000], eax\nmov    esi, ecx\nmov    DWORD PTR ss:[esp + 0x14], esi\npush   esi\nmov    DWORD PTR ss:[esp + 0x24], 0x00000004\ncall   0x0042f03f<<Func>>\n", 'color': "white", 'shape': 'box', 'font': {'size': '28', 'face': 'monospace', 'align': 'left'}},
 {'id': 'cfg_0x00405a4e', 'size': 150, 'label': "0x00405a4e:\ncmp    DWORD PTR ss:[esp + 0x30], 0x10\njb     0x00405a62<<Insn>>\n", 'color': "white", 'shape': 'box', 'font': {'size': '28', 'face': 'monospace', 'align': 'left'}},
 {'id': 'cfg_0x00405a5f', 'size': 150, 'label': "0x00405a5f:\nadd    esp, 0x04\n", 'color': "white", 'shape': 'box', 'font': {'size': '28', 'face': 'monospace', 'align': 'left'}},
]

edges = [
{'from': "000", 'to': "cfg_0x00405a39", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "000", 'to': "cfg_0x00405a39", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "000", 'to': "cfg_0x00405a49", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x00405a49", 'to': "cfg_0x00405a4e", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x00405a49", 'to': "cfg_0x00405a62", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x00405a55", 'to': "cfg_0x00405a5f", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x00405a55", 'to': "cfg_0x004095c6", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x004095c6", 'to': "cfg_0x00417563", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x00405a39", 'to': "cfg_0x00403450", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x00405a39", 'to': "cfg_0x00405a49", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x00403450", 'to': "cfg_0x00403489", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x00403450", 'to': "cfg_0x0042f03f", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x00405a4e", 'to': "cfg_0x00405a55", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x00405a4e", 'to': "cfg_0x00405a62", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
{'from': "cfg_0x00405a5f", 'to': "cfg_0x00405a62", 'arrows': 'to', 'physics': false, 'smooth': {'type': 'cubicBezier'}},
/*
*/
]

var container = document.getElementById('mynetwork');
var data = {'nodes': nodes, 'edges': edges}
var gph = new vis.Network(container, data, opts);