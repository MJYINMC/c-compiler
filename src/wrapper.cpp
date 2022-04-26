/*  src/wrapper.cpp
 *  Zhiyuan Pan, Zhejiang University
 *  zy_pan@zju.edu.cn
 *  Mon Apr 25, 2022
 */

#include <string>
#include <vector>
#include <cstring>
#include <unistd.h>
#include <iostream>

// frontend header is here
#include "frontend/frontend.h"

// include backend header here in the future
// ......

using namespace std;

#define GNU_LD  "/usr/bin/ld"
#define DEFAULT_LINKER  GNU_LD
#define ZJUCC_CRT_DIR "./runtime"
#define DEFAULT_LIBC_DIR ZJUCC_CRT_DIR

// Wrapper class for system linker
class Linker {
public:
    Linker(string __linker_path = DEFAULT_LINKER) :
        linker_path(__linker_path) {
        ld_args.push_back(linker_path);
    }

    ~Linker() = default;

    void add_object(string filename) {
        ld_args.push_back(filename);
    }

    void set_target(string filename = "a.out") {
        ld_args.push_back("-o");
        ld_args.push_back(filename);
    }

    void set_link_library(string link_dir = DEFAULT_LIBC_DIR, string lib_name = "c") {
        ld_args.push_back("-L" + link_dir);
        ld_args.push_back("-l" + lib_name);
    }
    
    void exec() {
        set_link_library(); // link libc by default
        char** __argv = new char* [ld_args.size()];
        for (int i = 0;i < ld_args.size();i++) {
            __argv[i] = strdup(ld_args[i].c_str());
            puts(__argv[i]);
        }
        ::execvp(linker_path.c_str(), __argv);
        printf("failed\n");
    }
private:
    string linker_path;
    vector<string> ld_args;
};

// This is a function that wraps up frontend and backend.
// After backend generates object code, the function then calls
// system linker (e.g., GNU ld) to link runtime libraries to
// obtain final executable files
int main(int argc, char** argv) {
    // frontend API call is here
    // lib_frontend_ret p = frontend_entry(argc, argv);
    // backend API call is here
    // *TODO*: complete this part with backend public APIs in the future...
    // ......

    // wrapper is here
    Linker ld = Linker();
    ld.add_object("output.o"); // *TODO*: use filename from backend output in the future ...
    ld.set_target("a.out"); // *TODO*: use filename from frontend output in the future ...

    ld.exec();
    return 0;
}